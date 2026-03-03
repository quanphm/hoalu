import { createCollectionFactory } from "#app/lib/collections/create-collection-factory.ts";
import { CurrencySchema, RepeatSchema } from "@hoalu/common/schema";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import * as z from "zod";

const RecurringBillCollectionSchema = z.object({
	id: z.uuidv7(),
	title: z.string(),
	description: z.string().nullable(),
	amount: z.coerce.number(),
	currency: CurrencySchema,
	repeat: RepeatSchema,
	anchor_date: z.string(),
	due_day: z.coerce.number().int().nullable(),
	due_month: z.coerce.number().int().nullable(),
	wallet_id: z.uuidv7(),
	category_id: z.uuidv7().nullable(),
	workspace_id: z.uuidv7(),
	creator_id: z.uuidv7(),
	is_active: z.boolean(),
	created_at: z.string(),
	updated_at: z.string(),
});

const factory = createCollectionFactory("recurring-bill", (slug: string) =>
	createCollection(
		electricCollectionOptions({
			id: `recurring-bill-${slug}`,
			getKey: (item) => item.id,
			shapeOptions: {
				url: `${import.meta.env.PUBLIC_API_URL}/sync/recurring-bills?workspaceIdOrSlug=${encodeURIComponent(slug)}`,
			},
			schema: RecurringBillCollectionSchema,
		}),
	),
);

export const recurringBillCollectionFactory = factory.get;
export const clearRecurringBillCollection = factory.clear;

export type RecurringBillCollectionItem = z.infer<typeof RecurringBillCollectionSchema>;
