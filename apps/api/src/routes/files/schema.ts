import { type } from "arktype";
import { isoDateSchema } from "../../common/schema";

export const uploadUrlSchema = type({
	"+": "delete",
	id: "string.uuid.v7",
	name: "string > 0",
	s3Url: "string",
	uploadUrl: "string",
});

export const fileMetaSchema = type({
	size: "number > 0",
	type: "string > 0",
	"tags?": "string[]",
	"description?": "string",
});

export const fileSchema = type({
	"+": "delete",
	name: "string > 0",
	description: "string | null",
	tags: "string[]",
	presignedUrl: "string > 0",
	createdAt: isoDateSchema,
});

export const filesSchema = fileSchema.array().onUndeclaredKey("delete");
