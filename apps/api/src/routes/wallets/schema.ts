import { type } from "arktype";

import { CurrencySchema, IsoDateSchema, WalletTypeSchema } from "../../common/schema";

export const WalletSchema = type({
	"+": "delete",
	id: "string.uuid.v7",
	name: "string",
	description: "string | null",
	currency: "string",
	type: WalletTypeSchema,
	isActive: "boolean",
	createdAt: IsoDateSchema,
	owner: {
		"+": "delete",
		id: "string.uuid.v7",
		publicId: "string",
		name: "string",
		email: "string.email",
		image: "string | null",
	},
	total: "number",
});

export const WalletsSchema = WalletSchema.array().onUndeclaredKey("delete");

export const InsertWalletSchema = type({
	name: "string > 0",
	"description?": "string",
	currency: CurrencySchema,
	type: WalletTypeSchema,
	isActive: "boolean = true",
});

export const UpdateWalletSchema = type({
	name: "string > 0",
	"description?": "string",
	currency: CurrencySchema,
	type: WalletTypeSchema,
	isActive: "boolean = true",
	ownerId: "string.uuid.v7",
}).partial();

export const DeletetWalletSchema = type({
	id: "string.uuid.v7",
});
