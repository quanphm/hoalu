import { type } from "arktype";
import { repeatSchema, walletTypeSchema } from "../../common/schema";

export const expenseSchema = type({
	"+": "delete",
	id: "string.uuid.v7",
	title: "string",
	description: "string | null",
	amount: "string.numeric.parse",
	currency: "string",
	repeat: repeatSchema,
	date: "string",
	walletId: "string.uuid.v7",
	categoryId: "string.uuid.v7",
	creator: {
		"+": "delete",
		id: "string.uuid.v7",
		publicId: "string",
		name: "string",
		email: "string.email",
		image: "string | null",
	},
	wallet: {
		"+": "delete",
		id: "string.uuid.v7",
		name: "string",
		description: "string | null",
		currency: "string",
		type: walletTypeSchema,
		isActive: "boolean",
	},
	category: {
		"+": "delete",
		id: "string.uuid.v7",
		name: "string",
		description: "string | null",
		color: "string",
	},
	createdAt: "string",
});

export const expensesSchema = expenseSchema.array().onUndeclaredKey("delete");

export const insertExpenseSchema = type({
	title: "string > 0",
	"description?": "string",
	amount: "number",
	currency: "string = 'USD'",
	repeat: repeatSchema,
	date: "string",
	walletId: "string.uuid.v7",
	categoryId: "string.uuid.v7",
});

export const updateExpenseSchema = insertExpenseSchema.partial();

export const deleteExpenseSchema = type({
	"+": "delete",
	id: "string.uuid.v7",
}).or("null");
