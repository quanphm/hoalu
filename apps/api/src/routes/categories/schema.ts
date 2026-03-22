import { ColorSchema, CategoryTypeSchema } from "@hoalu/common/schema";
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
	name: z.string().min(1),
	description: z.optional(z.string()),
	color: ColorSchema.default("gray"),
	type: CategoryTypeSchema,
});

export const UpdateCategorySchema = InsertCategorySchema.partial();

export const DeleteCategorySchema = z.object({
	id: z.uuidv7(),
});

export const LiteCategorySchema = CategorySchema.pick({
	id: true,
	name: true,
	description: true,
	color: true,
	type: true,
});
