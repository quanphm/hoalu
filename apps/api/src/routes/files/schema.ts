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
	name: "string.lower",
	size: "number > 0",
	type: "string > 0",
	"tags?": "string[]",
	"description?": "string",
});

export const fileSchema = type({
	"+": "delete",
	presignedUrl: "string > 0",
	fileName: "string > 0",
	description: "string | null",
	tags: "string[]",
	createdAt: isoDateSchema,
});

export const filesSchema = fileSchema.array().onUndeclaredKey("delete");
