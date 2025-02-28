import { type } from "arktype";
import { walletTypeSchema } from "../../common";

export const walletSchema = type({
	"+": "delete",
	id: "string.uuid.v7",
	name: "string",
	description: "string | null",
	currency: "string",
	type: "string",
	createdAt: "string",
	isActive: "boolean",
	owner: {
		"+": "delete",
		id: "string.uuid.v7",
		publicId: "string",
		name: "string",
		email: "string.email",
		image: "string | null",
	},
	workspace: {
		"+": "delete",
		id: "string.uuid.v7",
		publicId: "string",
		slug: "string",
		name: "string",
		logo: "string | null",
	},
});

export const walletsSchema = walletSchema.array().onUndeclaredKey("delete");

export const insertWalletSchema = type({
	name: "string > 0",
	"description?": "string",
	currency: "string",
	type: walletTypeSchema,
	isActive: "boolean = true",
});

export const updateWalletSchema = insertWalletSchema.partial();

export const deletetWalletSchema = type({
	"+": "delete",
	id: "string.uuid.v7",
}).or("null");
