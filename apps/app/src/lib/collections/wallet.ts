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

const collectionCreateHelper = (slug: string) =>
	createCollection(
		electricCollectionOptions({
			id: `wallet-${slug}`,
			getKey: (item) => item.id,
			shapeOptions: {
				url: `${import.meta.env.PUBLIC_API_URL}/sync/wallets?workspaceIdOrSlug=${slug}`,
			},
			schema: WalletCollectionSchema,
		}),
	);

type WalletCollection = ReturnType<typeof collectionCreateHelper>;

const instances = new Map<string, WalletCollection>();

export function walletCollectionFactory(slug: string) {
	if (instances.has(slug)) {
		return instances.get(slug) as WalletCollection;
	}

	const collection = collectionCreateHelper(slug);
	instances.set(slug, collection);

	return collection;
}
