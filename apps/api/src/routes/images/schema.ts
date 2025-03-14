import { type } from "arktype";

export const uploadUrlSchema = type({
	"+": "delete",
	fileName: "string > 0",
	path: "string",
	uploadUrl: "string",
});

export const fileMetaSchema = type({
	size: "number > 0",
});

export const imageSchema = type({
	"+": "delete",
	presignedUrl: "string",
	fileName: "string",
	description: "string | null",
	tags: "string[]",
});

export const imagesSchema = imageSchema.array().onUndeclaredKey("delete");
