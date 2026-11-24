import { CurrencySchema, IsoDateSchema, RepeatSchema } from "@hoalu/schema/schema";
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

const ExpenseCollectionSchema = z.object({
	id: z.uuidv7(),
	public_id: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	amount: z.coerce.number(),
	currency: CurrencySchema,
	repeat: RepeatSchema,
	date: IsoDateSchema,
	wallet_id: z.uuidv7(),
	category_id: z.uuidv7().nullable(),
	recurring_bill_id: z.uuidv7().nullable(),
	event_id: z.uuidv7().nullable(),
	creator_id: z.uuid(),
	created_at: IsoDateSchema,
});

const factory = createCollectionFactory("expense", (slug: string) => {
	const options = electricCollectionOptions({
		id: `expense-${slug}`,
		getKey: (item) => item.id,
		shapeOptions: {
			url: `${import.meta.env.PUBLIC_API_URL}/sync/expenses?workspaceIdOrSlug=${encodeURIComponent(slug)}`,
		},
		schema: ExpenseCollectionSchema,
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

	collection.createIndex((row) => row.wallet_id, { indexType: BasicIndex });
	collection.createIndex((row) => row.category_id, { indexType: BasicIndex });
	collection.createIndex((row) => row.event_id, { indexType: BasicIndex });
	collection.createIndex((row) => row.recurring_bill_id, { indexType: BasicIndex });
	collection.createIndex((row) => row.date, { indexType: BasicIndex });
	return collection;
});

export const expenseCollectionFactory = (slug: string) => factory.get(slug);
export const clearExpenseCollection = (slug?: string) => factory.clear(slug);
