import { type } from "arktype";

import { ColorSchema } from "../../common/schema";

export const CategorySchema = type({
	"+": "delete",
	id: "string.uuid.v7",
	name: "string",
	description: "string | null",
	color: ColorSchema,
	total: "number",
});

export const CategoriesSchema = CategorySchema.array().onUndeclaredKey("delete");

export const InsertCategorySchema = type({
	name: "string > 0",
	"description?": "string",
	color: ColorSchema.default("gray"),
});

export const UpdateCategorySchema = InsertCategorySchema.partial();

export const DeleteCategorySchema = type({
	id: "string.uuid.v7",
});

export const LiteCategorySchema = CategorySchema.pick("id", "name", "description", "color");
