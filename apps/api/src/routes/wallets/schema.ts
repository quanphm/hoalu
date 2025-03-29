import { type } from "arktype";
import { currencySchema, isoDateSchema, walletTypeSchema } from "../../common/schema";

export const WalletSchema = type({
	"+": "delete",
	id: "string.uuid.v7",
	name: "string",
	description: "string | null",
	currency: "string",
	type: walletTypeSchema,
	isActive: "boolean",
	createdAt: isoDateSchema,
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

export const WalletsSchema = WalletSchema.array().onUndeclaredKey("delete");

export const InsertWalletSchema = type({
	name: "string > 0",
	"description?": "string",
	currency: currencySchema,
	type: walletTypeSchema,
	isActive: "boolean = true",
});

export const UpdateWalletSchema = InsertWalletSchema.partial();

export const DeletetWalletSchema = type({
	"+": "delete",
	id: "string.uuid.v7",
}).or("null");
