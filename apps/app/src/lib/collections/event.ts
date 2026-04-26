import { createCollectionFactory } from "#app/lib/collections/create-collection-factory.ts";
import { CurrencySchema, IsoDateSchema } from "@hoalu/common/schema";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import * as z from "zod";

const EventCollectionSchema = z.object({
	id: z.uuidv7(),
	public_id: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	start_date: z.string().nullable(),
	end_date: z.string().nullable(),
	budget: z.coerce.number().nullable(),
	budget_currency: CurrencySchema,
	status: z.enum(["open", "closed"]),
	workspace_id: z.uuidv7(),
	created_at: IsoDateSchema,
	updated_at: IsoDateSchema,
});

const factory = createCollectionFactory("event", (slug: string) =>
	createCollection(
		electricCollectionOptions({
			id: `event-${slug}`,
			getKey: (item) => item.id,
			shapeOptions: {
				url: `${import.meta.env.PUBLIC_API_URL}/sync/events?workspaceIdOrSlug=${encodeURIComponent(slug)}`,
			},
			schema: EventCollectionSchema,
		}),
	),
);

export const eventCollectionFactory = factory.get;
export const clearEventCollection = factory.clear;
