import * as z from "zod";

import { CurrencySchema, IsoDateSchema, WalletTypeSchema } from "../../common/schema";

export const WalletSchema = z.object({
	id: z.uuidv7(),
	name: z.string(),
	description: z.string().nullable(),
	currency: CurrencySchema,
	type: WalletTypeSchema,
	isActive: z.boolean(),
	createdAt: IsoDateSchema,
	owner: z.object({
		id: z.uuidv7(),
		publicId: z.string(),
		name: z.string(),
		email: z.email(),
		image: z.string().nullable(),
	}),
	total: z.number(),
});

export const WalletsSchema = z.array(WalletSchema);

export const InsertWalletSchema = z.object({
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
		ownerId: z.uuidv7(),
	})
	.partial();

export const DeleteWalletSchema = z.object({
	id: z.uuidv7(),
});

export const LiteWalletSchema = WalletSchema.pick({
	id: true,
	name: true,
	description: true,
	currency: true,
	type: true,
	isActive: true,
});
