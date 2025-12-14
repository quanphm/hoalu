import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import * as z from "zod";

import { CurrencySchema, WalletTypeSchema } from "@hoalu/common/schema";

import { createCollectionFactory } from "#app/lib/collections/create-collection-factory.ts";

const WalletCollectionSchema = z.object({
	id: z.uuidv7(),
	name: z.string(),
	description: z.string().nullable(),
	currency: CurrencySchema,
	type: WalletTypeSchema,
	is_active: z.boolean(),
});

const factory = createCollectionFactory("wallet", (slug: string) =>
	createCollection(
		electricCollectionOptions({
			id: `wallet-${slug}`,
			getKey: (item) => item.id,
			shapeOptions: {
				url: `${import.meta.env.PUBLIC_API_URL}/sync/wallets?workspaceIdOrSlug=${encodeURIComponent(slug)}`,
			},
			schema: WalletCollectionSchema,
		}),
	),
);

export const walletCollectionFactory = factory.get;
export const clearWalletCollection = factory.clear;
