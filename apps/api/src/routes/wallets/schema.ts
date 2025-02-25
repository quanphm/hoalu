import { type } from "arktype";

export const typeSchema = type(
	"'cash' | 'bank-account' | 'credit-card' |'debit-card' | 'digital-account'",
);

export const walletSchema = type({
	"+": "delete",
	id: "string",
	name: "string",
	description: "string | null",
	currency: "string",
	type: "string",
	createdAt: "string",
	owner: {
		"+": "delete",
		id: "string.uuid",
		publicId: "string",
		name: "string",
		email: "string.email",
		image: "string | null",
	},
	workspace: {
		"+": "delete",
		id: "string.uuid",
		publicId: "string",
		slug: "string",
		name: "string",
		logo: "string | null",
	},
});

export const walletsSchema = walletSchema.array().onUndeclaredKey("delete");

export const insertWalletSchema = type({
	name: "string > 0",
	"description?": "string | undefined",
	currency: "string",
	type: typeSchema,
	isActive: "boolean = true",
});

export const updateTaskSchema = insertWalletSchema.partial();
