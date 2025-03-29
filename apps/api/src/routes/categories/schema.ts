import { type } from "arktype";
import { colorSchema } from "../../common/schema";

export const CategorySchema = type({
	"+": "delete",
	id: "string.uuid.v7",
	name: "string",
	description: "string | null",
	color: colorSchema,
});

export const CategoriesSchema = CategorySchema.array().onUndeclaredKey("delete");

export const InsertCategorySchema = type({
	name: "string > 0",
	"description?": "string",
	color: colorSchema.default("gray"),
});

export const UpdateCategorySchema = InsertCategorySchema.partial();

export const DeleteCategorySchema = type({
	"+": "delete",
	id: "string.uuid.v7",
}).or("null");
