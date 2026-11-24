import { ColorSchema, CategoryTypeSchema } from "@hoalu/schema/schema";
import * as z from "zod";

export const CategorySchema = z.object({
	id: z.uuidv7(),
	name: z.string(),
	description: z.string().nullable(),
	color: ColorSchema,
	type: CategoryTypeSchema,
	total: z.number(),
});

export const CategoriesSchema = z.array(CategorySchema);

export const InsertCategorySchema = z.object({
	id: z.uuidv7().optional(),
	publicId: z.string().optional(),
	name: z.string().min(1),
	description: z.optional(z.string()),
	color: ColorSchema.default("gray"),
	type: CategoryTypeSchema,
});

export const UpdateCategorySchema = InsertCategorySchema.omit({
	type: true,
	id: true,
	publicId: true,
}).partial();

export const DeleteCategorySchema = z.object({
	id: z.uuidv7(),
	txid: z.coerce.number(),
});

export const LiteCategorySchema = CategorySchema.pick({
	id: true,
	name: true,
	description: true,
	color: true,
	type: true,
}).extend({ txid: z.coerce.number() });
