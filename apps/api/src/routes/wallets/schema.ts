import { CurrencySchema, IsoDateSchema, WalletTypeSchema } from "@hoalu/schema/schema";
import * as z from "zod";

export const WalletSchema = z.object({
	id: z.uuidv7(),
	name: z.string(),
	description: z.string().nullable(),
	currency: CurrencySchema,
	type: WalletTypeSchema,
	isActive: z.boolean(),
	createdAt: IsoDateSchema,
	owner: z.object({
		// User ids come from the auth layer, not from our generator, so they are not
		// guaranteed to be v7 — a v4 owner must not fail the whole wallet list.
		id: z.uuid(),
		publicId: z.string(),
		name: z.string(),
		email: z.email(),
		image: z.string().nullable(),
	}),
	total: z.number(),
});

export const WalletsSchema = z.array(WalletSchema);

export const InsertWalletSchema = z.object({
	id: z.uuidv7().optional(),
	publicId: z.string().optional(),
	name: z.string().min(1),
	description: z.optional(z.string()),
	currency: CurrencySchema,
	type: WalletTypeSchema,
	isActive: z.boolean().default(true),
});

export const UpdateWalletSchema = z
	.object({
		name: z.string().min(1),
		description: z.optional(z.string()),
		currency: CurrencySchema,
		type: WalletTypeSchema,
		isActive: z.boolean(),
		ownerId: z.uuid(),
	})
	.partial();

export const DeleteWalletSchema = z.object({
	id: z.uuidv7(),
	txid: z.coerce.number(),
});

export const LiteWalletSchema = WalletSchema.pick({
	id: true,
	name: true,
	description: true,
	currency: true,
	type: true,
	isActive: true,
}).extend({ txid: z.coerce.number() });
