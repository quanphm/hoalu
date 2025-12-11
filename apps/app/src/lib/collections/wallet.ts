import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import * as z from "zod";

import { CurrencySchema, WalletTypeSchema } from "@hoalu/common/schema";

const WalletCollectionSchema = z.object({
	id: z.uuidv7(),
	name: z.string(),
	description: z.string().nullable(),
	currency: CurrencySchema,
	type: WalletTypeSchema,
	is_active: z.boolean(),
});

export const walletCollection = (slug: string) => {
	return createCollection(
		electricCollectionOptions({
			getKey: (item) => item.id,
			schema: WalletCollectionSchema,
			shapeOptions: {
				url: `${import.meta.env.PUBLIC_API_URL}/sync/wallets?workspaceIdOrSlug=${slug}`,
			},
		}),
	);
};
