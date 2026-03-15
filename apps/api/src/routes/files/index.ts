import { createHonoInstance } from "#api/lib/create-app.ts";
import { batchExtractReceiptData } from "#api/lib/ocr.ts";
import { bunS3Client } from "#api/lib/s3.ts";
import { parseVoiceExpense } from "#api/lib/voice.ts";
import { workspaceMember } from "#api/middlewares/workspace-member.ts";
import { CategoryRepository } from "#api/routes/categories/repository.ts";
import { FileRepository } from "#api/routes/files/repository.ts";
import { FileMetaSchema, FilesSchema, UploadUrlSchema } from "#api/routes/files/schema.ts";
import { getS3Path, isValidFileType } from "#api/utils/io.ts";
import { idParamValidator } from "#api/validators/id-param.ts";
import { jsonBodyValidator } from "#api/validators/json-body.ts";
import { workspaceQueryValidator } from "#api/validators/workspace-query.ts";
import { TIME_IN_SECONDS } from "@hoalu/common/datetime";
import { generateId } from "@hoalu/common/generate-id";
import { HTTPStatus } from "@hoalu/common/http-status";
import { FILE_SIZE_LIMIT } from "@hoalu/common/io";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import { OpenAPI } from "@hoalu/furnace";
import { describeRoute } from "hono-openapi";
import * as z from "zod";

const app = createHonoInstance();
const fileRepository = new FileRepository();
const categoryRepository = new CategoryRepository();
const TAGS = ["Files"];

const route = app
	.post(
		"/generate-upload-url",
		describeRoute({
			tags: TAGS,
			summary: "Generate presigned upload URL",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: UploadUrlSchema }), HTTPStatus.codes.CREATED),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		jsonBodyValidator(FileMetaSchema),
		async (c) => {
			const workspace = c.get("workspace");
			const payload = c.req.valid("json");

			if (payload.size > FILE_SIZE_LIMIT) {
				return c.json({ message: "Maximum file size reached" }, HTTPStatus.codes.BAD_REQUEST);
			}

			const fileKind = isValidFileType(payload.type);
			if (!fileKind) {
				return c.json({ message: "Invalid file type" }, HTTPStatus.codes.BAD_REQUEST);
			}

			const fileName = generateId({ use: "nanoid", kind: fileKind });
			const path = `${workspace.publicId}/${fileName}`;
			const s3Url = `s3://${path}`;

			const uploadUrl = bunS3Client.presign(path, {
				expiresIn: TIME_IN_SECONDS.MINUTE * 5, //  5 min
				method: "PUT",
			});
			const fileSlot = await fileRepository.insert({
				id: generateId({ use: "uuid" }),
				name: fileName,
				tags: payload.tags,
				description: payload.description,
				s3Url,
			});

			const parsed = UploadUrlSchema.safeParse({
				...fileSlot,
				uploadUrl,
			});
			if (!parsed.success) {
				return c.json(
					{ message: createIssueMsg(parsed.error.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed.data }, HTTPStatus.codes.CREATED);
		},
	)
	.get(
		"/workspace",
		describeRoute({
			tags: TAGS,
			summary: "Get all files from workspace",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: FilesSchema }), HTTPStatus.codes.OK),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");

			const files = await fileRepository.findAllByWorkspaceId({ workspaceId: workspace.id });
			const filesWithPresignedUrl = await Promise.all(
				files.map(async (file) => {
					const path = getS3Path(file.s3Url);
					const presignedUrl = bunS3Client.presign(path, {
						expiresIn: TIME_IN_SECONDS.DAY, // 1 day
					});
					return { ...file, presignedUrl };
				}),
			);

			const parsed = FilesSchema.safeParse(filesWithPresignedUrl);
			if (!parsed.success) {
				return c.json(
					{ message: createIssueMsg(parsed.error.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed.data }, HTTPStatus.codes.OK);
		},
	)
	.get(
		"/workspace/logo",
		describeRoute({
			tags: TAGS,
			summary: "Get workspace logo",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: z.string().nullable() }), HTTPStatus.codes.OK),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			if (workspace.logo) {
				const path = getS3Path(workspace.logo);
				const file = bunS3Client.presign(path, {
					expiresIn: TIME_IN_SECONDS.DAY, // 1 day
				});
				return c.json({ data: file }, HTTPStatus.codes.OK);
			}
			return c.json({ data: null }, HTTPStatus.codes.OK);
		},
	)
	.post(
		"/scan-receipt",
		describeRoute({
			tags: TAGS,
			summary: "Scan one or more receipt images with OCR",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(
					z.object({
						data: z.array(
							z
								.object({
									amount: z.number(),
									date: z.string(),
									merchantName: z.string(),
									suggestedCategoryId: z.uuid().nullable(),
									currency: z.string(),
									confidence: z.number(),
									items: z
										.array(
											z.object({
												name: z.string(),
												quantity: z.number().optional(),
												price: z.number().optional(),
											}),
										)
										.optional(),
								})
								.nullable(),
						),
					}),
					HTTPStatus.codes.OK,
				),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		jsonBodyValidator(z.object({ imagesBase64: z.array(z.string()).min(1).max(10) })),
		async (c) => {
			const workspace = c.get("workspace");
			const payload = c.req.valid("json");

			const categories = await categoryRepository.findAllByWorkspaceId({
				workspaceId: workspace.id,
			});

			const results = await batchExtractReceiptData(
				payload.imagesBase64,
				categories.map((cat) => ({ id: cat.id, name: cat.name })),
			);

			// Log summary
			const successCount = results.filter(Boolean).length;
			console.log(
				`[OCR] Scanned ${payload.imagesBase64.length} image(s), ${successCount} succeeded`,
			);

			return c.json({ data: results }, HTTPStatus.codes.OK);
		},
	)
	.post(
		"/parse-voice",
		describeRoute({
			tags: TAGS,
			summary: "Parse voice transcription into structured expense data",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(
					z.object({
						data: z
							.object({
								title: z.string(),
								amount: z.number(),
								currency: z.string(),
								date: z.string(),
								suggestedCategoryId: z.uuid().nullable(),
								repeat: z.enum(["one-time", "daily", "weekly", "monthly", "yearly"]),
								confidence: z.number(),
							})
							.nullable(),
					}),
					HTTPStatus.codes.OK,
				),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		jsonBodyValidator(
			z.object({
				transcription: z.string().min(1),
				lang: z.enum(["en-US", "vi-VN"]).default("en-US"),
			}),
		),
		async (c) => {
			const workspace = c.get("workspace");
			const payload = c.req.valid("json");

			// Fetch workspace categories for AI matching
			const categories = await categoryRepository.findAllByWorkspaceId({
				workspaceId: workspace.id,
			});

			const today = new Date().toISOString().split("T")[0] as string;

			const voiceData = await parseVoiceExpense(
				payload.transcription,
				categories.map((cat) => ({ id: cat.id, name: cat.name })),
				{
					today,
					availableCurrencies: ["USD", "VND", "SGD", "EUR"],
					lang: payload.lang,
				},
			);

			if (voiceData) {
				console.log(`[Voice] Expense parsed - confidence: ${voiceData.confidence}`);
			}

			return c.json({ data: voiceData }, HTTPStatus.codes.OK);
		},
	)
	.get(
		"/workspace/expense/:id",
		describeRoute({
			tags: TAGS,
			summary: "Get files for an expense",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: FilesSchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const param = c.req.valid("param");

			const files = await fileRepository.findAllByExpenseId({
				expenseId: param.id,
				workspaceId: workspace.id,
			});

			const filesWithPresignedUrl = await Promise.all(
				files.map(async (file) => {
					const path = getS3Path(file.s3Url);
					const presignedUrl = bunS3Client.presign(path, {
						expiresIn: TIME_IN_SECONDS.DAY,
					});
					return { ...file, presignedUrl };
				}),
			);

			const parsed = FilesSchema.safeParse(filesWithPresignedUrl);
			if (!parsed.success) {
				return c.json(
					{ message: createIssueMsg(parsed.error.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed.data }, HTTPStatus.codes.OK);
		},
	)
	.post(
		"/workspace/expense/:id",
		describeRoute({
			tags: TAGS,
			summary: "Create files for an expense",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				[HTTPStatus.codes.CREATED]: {
					description: "Success",
				},
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		jsonBodyValidator(z.object({ ids: z.array(z.uuidv7()) })),
		async (c) => {
			const workspace = c.get("workspace");
			const param = c.req.valid("param");
			const payload = c.req.valid("json");

			const values = payload.ids.map((id) => ({
				fileId: id,
				workspaceId: workspace.id,
				expenseId: param.id,
			}));
			await fileRepository.insertFileExpense(values);

			return c.body(null, HTTPStatus.codes.CREATED);
		},
	)
	.delete(
		"/workspace/expense/:expenseId/file/:fileId",
		describeRoute({
			tags: TAGS,
			summary: "Delete a file from an expense",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.not_found(),
				[HTTPStatus.codes.NO_CONTENT]: {
					description: "Success",
				},
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const { expenseId, fileId } = c.req.param();

			const result = await fileRepository.deleteFileExpense({
				fileId,
				expenseId,
				workspaceId: workspace.id,
			});

			if (!result) {
				return c.json({ message: "File not found" }, HTTPStatus.codes.NOT_FOUND);
			}

			const path = getS3Path(result.s3Url);
			await bunS3Client.delete(path);

			return c.body(null, HTTPStatus.codes.NO_CONTENT);
		},
	);

export default route;
