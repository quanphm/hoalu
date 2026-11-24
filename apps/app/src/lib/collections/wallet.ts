import { CurrencySchema, WalletTypeSchema } from "@hoalu/schema/schema";
import { persistedCollectionOptions } from "@tanstack/browser-db-sqlite-persistence";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { BasicIndex, createCollection } from "@tanstack/react-db";
import * as z from "zod";

import { createCollectionFactory } from "#app/lib/collections/create-collection-factory.ts";
import {
	getPersistence,
	INITIAL_RENDER,
	SCHEMA_VERSION,
} from "#app/lib/collections/persistence.ts";

const WalletCollectionSchema = z.object({
	id: z.uuidv7(),
	name: z.string(),
	description: z.string().nullable(),
	currency: CurrencySchema,
	type: WalletTypeSchema,
	is_active: z.boolean(),
	owner_id: z.uuid(),
});

const factory = createCollectionFactory("wallet", (slug: string) => {
	const options = electricCollectionOptions({
		id: `wallet-${slug}`,
		getKey: (item) => item.id,
		shapeOptions: {
			url: `${import.meta.env.PUBLIC_API_URL}/sync/wallets?workspaceIdOrSlug=${encodeURIComponent(slug)}`,
		},
		schema: WalletCollectionSchema,
	});

	const persistence = getPersistence();
	const collection = persistence
		? createCollection(
				persistedCollectionOptions({
					...options,
					persistence,
					schemaVersion: SCHEMA_VERSION,
					initialRender: INITIAL_RENDER,
				}),
			)
		: createCollection(options);

	collection.createIndex((row) => row.id, { indexType: BasicIndex });
	collection.createIndex((row) => row.owner_id, { indexType: BasicIndex });
	return collection;
});

export const walletCollectionFactory = (slug: string) => factory.get(slug);
export const clearWalletCollection = (slug?: string) => factory.clear(slug);
