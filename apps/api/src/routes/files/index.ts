import { type } from "arktype";
import { describeRoute } from "hono-openapi";

import { TIME_IN_SECONDS } from "@hoalu/common/datetime";
import { generateId } from "@hoalu/common/generate-id";
import { HTTPStatus } from "@hoalu/common/http-status";
import { FILE_SIZE_LIMIT } from "@hoalu/common/io";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import { OpenAPI } from "@hoalu/furnace";
import { getS3Path, isValidFileType } from "../../common/io";
import { createHonoInstance } from "../../lib/create-app";
import { bunS3Client } from "../../lib/s3";
import { workspaceMember } from "../../middlewares/workspace-member";
import { idParamValidator } from "../../validators/id-param";
import { jsonBodyValidator } from "../../validators/json-body";
import { workspaceQueryValidator } from "../../validators/workspace-query";
import { FileRepository } from "./repository";
import { FileMetaSchema, FilesSchema, UploadUrlSchema } from "./schema";

const app = createHonoInstance();
const fileRepository = new FileRepository();
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
				...OpenAPI.response(type({ data: UploadUrlSchema }), HTTPStatus.codes.CREATED),
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
				name: fileName,
				tags: payload.tags,
				description: payload.description,
				s3Url,
			});

			const parsed = UploadUrlSchema({
				...fileSlot,
				uploadUrl,
			});
			if (parsed instanceof type.errors) {
				return c.json(
					{ message: createIssueMsg(parsed.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed }, HTTPStatus.codes.CREATED);
		},
	)
	.get(
		"/workpsace",
		describeRoute({
			tags: TAGS,
			summary: "Get all files from workspace",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: FilesSchema }), HTTPStatus.codes.OK),
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

			const parsed = FilesSchema(filesWithPresignedUrl);
			if (parsed instanceof type.errors) {
				return c.json(
					{ message: createIssueMsg(parsed.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed }, HTTPStatus.codes.OK);
		},
	)
	.get(
		"/workpsace/logo",
		describeRoute({
			tags: TAGS,
			summary: "Get workspace logo",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: type("string | null") }), HTTPStatus.codes.OK),
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
		jsonBodyValidator(type({ ids: "string.uuid.v7[]" })),
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
	);

export default route;
