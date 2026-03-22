import { createCollectionFactory } from "#app/lib/collections/create-collection-factory.ts";
import { CurrencySchema, IsoDateSchema, RepeatSchema } from "@hoalu/common/schema";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import * as z from "zod";

const IncomeCollectionSchema = z.object({
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
	updated_at: IsoDateSchema,
});

export type IncomeCollectionItem = z.infer<typeof IncomeCollectionSchema>;

const factory = createCollectionFactory("income", (slug: string) =>
	createCollection(
		electricCollectionOptions({
			id: `income-${slug}`,
			getKey: (item) => item.id,
			shapeOptions: {
				url: `${import.meta.env.PUBLIC_API_URL}/sync/incomes?workspaceIdOrSlug=${encodeURIComponent(slug)}`,
			},
			schema: IncomeCollectionSchema,
		}),
	),
);

export const incomeCollectionFactory = factory.get;
export const clearIncomeCollection = factory.clear;
