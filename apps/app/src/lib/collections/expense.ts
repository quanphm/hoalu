import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import * as z from "zod";

import { CurrencySchema, IsoDateSchema, RepeatSchema } from "@hoalu/common/schema";

const ExpenseCollectionSchema = z.object({
	id: z.uuidv7(),
	title: z.string(),
	description: z.string().nullable(),
	amount: z.coerce.number(),
	currency: CurrencySchema,
	repeat: RepeatSchema,
	date: IsoDateSchema,
	wallet_id: z.uuidv7(),
	category_id: z.uuidv7(),
	creator_id: z.uuidv7(),
	created_at: IsoDateSchema,
});

const collectionCreateHelper = (slug: string) =>
	createCollection(
		electricCollectionOptions({
			id: `expense-${slug}`,
			getKey: (item) => item.id,
			shapeOptions: {
				url: `${import.meta.env.PUBLIC_API_URL}/sync/expenses?workspaceIdOrSlug=${slug}`,
			},
			schema: ExpenseCollectionSchema,
		}),
	);

type ExpenseCollection = ReturnType<typeof collectionCreateHelper>;

const instances = new Map<string, ExpenseCollection>();

export function expenseCollectionFactory(slug: string) {
	if (instances.has(slug)) {
		return instances.get(slug) as ExpenseCollection;
	}

	const collection = collectionCreateHelper(slug);
	instances.set(slug, collection);

	return collection;
}
