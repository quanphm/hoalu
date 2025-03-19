import { type } from "arktype";
import { isoDateSchema } from "../../common/schema";

export const uploadUrlSchema = type({
	"+": "delete",
	id: "string.uuid.v7",
	fileName: "string > 0",
	s3Url: "string",
	uploadUrl: "string",
});

export const fileMetaSchema = type({
	size: "number > 0",
});

export const imageSchema = type({
	"+": "delete",
	presignedUrl: "string > 0",
	fileName: "string > 0",
	description: "string | null",
	tags: "string[]",
	createdAt: isoDateSchema,
});

export const imagesSchema = imageSchema.array().onUndeclaredKey("delete");
