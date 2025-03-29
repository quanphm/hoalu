import { type } from "arktype";
import { isoDateSchema } from "../../common/schema";

export const UploadUrlSchema = type({
	"+": "delete",
	id: "string.uuid.v7",
	name: "string > 0",
	s3Url: "string",
	uploadUrl: "string",
});

export const FileMetaSchema = type({
	size: "number > 0",
	type: "string > 0",
	"tags?": "string[]",
	"description?": "string",
});

export const FileSchema = type({
	"+": "delete",
	name: "string > 0",
	description: "string | null",
	tags: "string[]",
	presignedUrl: "string > 0",
	createdAt: isoDateSchema,
});

export const FilesSchema = FileSchema.array().onUndeclaredKey("delete");
