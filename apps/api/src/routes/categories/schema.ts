import { type } from "arktype";
import { colorSchema } from "../../common";

export const categorySchema = type({
	"+": "delete",
	id: "string",
	name: "string",
	description: "string | null",
	color: colorSchema,
});

export const categoriesSchema = categorySchema.array().onUndeclaredKey("delete");

export const insertCategorySchema = type({
	name: "string > 0",
	"description?": "string",
	"color?": colorSchema,
});

export const updateCategorySchema = insertCategorySchema.partial();

export const deleteCategorySchema = type({
	"+": "delete",
	id: "string",
}).or("null");
