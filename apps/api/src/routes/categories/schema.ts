import { type } from "arktype";
import { colorSchema } from "../../common/schema";

export const categorySchema = type({
	"+": "delete",
	id: "string.uuid.v7",
	name: "string",
	description: "string | null",
	color: colorSchema,
});

export const categoriesSchema = categorySchema.array().onUndeclaredKey("delete");

export const insertCategorySchema = type({
	name: "string > 0",
	"description?": "string",
	color: colorSchema.default("gray"),
});

export const updateCategorySchema = insertCategorySchema.partial();

export const deleteCategorySchema = type({
	"+": "delete",
	id: "string.uuid.v7",
}).or("null");
