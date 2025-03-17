import { generateId } from "@hoalu/common/generate-id";
import { HTTPStatus } from "@hoalu/common/http-status";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import { TIME_IN_SECONDS } from "@hoalu/common/time";
import { OpenAPI } from "@hoalu/furnace";
import { type } from "arktype";
import { describeRoute } from "hono-openapi";
import { MAX_UPLOAD_FILE_SIZE } from "../../common/io";
import { createHonoInstance } from "../../lib/create-app";
import { bunS3Client } from "../../lib/s3";
import { workspaceMember } from "../../middlewares/workspace-member";
import { jsonBodyValidator } from "../../validators/json-body";
import { workspaceQueryValidator } from "../../validators/workspace-query";
import { ImageRepository } from "./repository";
import { fileMetaSchema, imagesSchema, uploadUrlSchema } from "./schema";

const app = createHonoInstance();
const imageRepository = new ImageRepository();
const TAGS = ["Images"];

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
				...OpenAPI.response(type({ data: uploadUrlSchema }), HTTPStatus.codes.OK),
			},
		}),
		jsonBodyValidator(fileMetaSchema),
		async (c) => {
			const param = c.req.valid("json");

			if (param.size > MAX_UPLOAD_FILE_SIZE) {
				return c.json({ message: "Maximum file size reached" }, HTTPStatus.codes.BAD_REQUEST);
			}

			const fileName = generateId({ use: "nanoid", kind: "image" });
			const path = `uploads/${fileName}`;
			const s3Url = `s3://${process.env.S3_BUCKET}/${path}`;

			const uploadUrl = bunS3Client.presign(path, {
				expiresIn: TIME_IN_SECONDS.MINUTE * 5,
				method: "PUT",
			});
			const imageSlot = await imageRepository.insert({
				fileName,
				s3Url,
			});

			const parsed = uploadUrlSchema({
				...imageSlot,
				path,
				uploadUrl,
			});
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
		"/workpsace",
		describeRoute({
			tags: TAGS,
			summary: "Get all images from workspace",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: uploadUrlSchema }), HTTPStatus.codes.OK),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");

			const images = await imageRepository.findAllByWorkspaceId({ workspaceId: workspace.id });
			const imagesWithPresignedUrl = await Promise.all(
				images.map(async (image) => {
					const path = `uploads/${image.fileName}`;
					const presignedUrl = bunS3Client.presign(path, { expiresIn: TIME_IN_SECONDS.HOUR * 12 });
					return { ...image, presignedUrl };
				}),
			);

			const parsed = imagesSchema(imagesWithPresignedUrl);
			if (parsed instanceof type.errors) {
				return c.json(
					{ message: createIssueMsg(parsed.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed }, HTTPStatus.codes.OK);
		},
	);

export default route;
