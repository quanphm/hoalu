import { type } from "arktype";

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
		publicId: "string",
		name: "string",
		email: "string.email",
		image: "string | null",
	},
	workspace: {
		"+": "delete",
		publicId: "string",
		slug: "string",
		name: "string",
		logo: "string | null",
	},
});

export const walletsSchema = walletSchema.array().onUndeclaredKey("delete");
