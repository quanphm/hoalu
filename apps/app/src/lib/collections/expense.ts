import { createCollectionFactory } from "#app/lib/collections/create-collection-factory.ts";
import { CurrencySchema, IsoDateSchema, RepeatSchema } from "@hoalu/common/schema";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import * as z from "zod";

const ExpenseCollectionSchema = z.object({
	id: z.uuidv7(),
	title: z.string(),
	description: z.string().nullable(),
	amount: z.coerce.number(),
	currency: CurrencySchema,
	repeat: RepeatSchema,
	date: IsoDateSchema,
	wallet_id: z.uuidv7(),
	category_id: z.uuidv7().nullable(),
	creator_id: z.uuidv7(),
	created_at: IsoDateSchema,
});

const factory = createCollectionFactory("expense", (slug: string) =>
	createCollection(
		electricCollectionOptions({
			id: `expense-${slug}`,
			getKey: (item) => item.id,
			shapeOptions: {
				url: `${import.meta.env.PUBLIC_API_URL}/sync/expenses?workspaceIdOrSlug=${encodeURIComponent(slug)}`,
			},
			schema: ExpenseCollectionSchema,
		}),
	),
);

export const expenseCollectionFactory = factory.get;
export const clearExpenseCollection = factory.clear;
