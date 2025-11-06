import * as z from "zod";

import { IsoDateSchema } from "@hoalu/common/schema";

export const UploadUrlSchema = z.object({
	id: z.uuidv7(),
	name: z.string().min(1),
	s3Url: z.string(),
	uploadUrl: z.string(),
});

export const FileMetaSchema = z.object({
	size: z.number().positive(),
	type: z.string().min(1),
	tags: z.optional(z.array(z.string())),
	description: z.optional(z.string()),
});

export const FileSchema = z.object({
	name: z.string().min(1),
	description: z.string().nullable(),
	tags: z.optional(z.array(z.string())),
	presignedUrl: z.string().min(1),
	createdAt: IsoDateSchema,
});

export const FilesSchema = z.array(FileSchema);
