import { CurrencySchema, IsoDateSchema } from "@hoalu/schema/schema";
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

const factory = createCollectionFactory("event", (slug: string) => {
	const options = electricCollectionOptions({
		id: `event-${slug}`,
		getKey: (item) => item.id,
		shapeOptions: {
			url: `${import.meta.env.PUBLIC_API_URL}/sync/events?workspaceIdOrSlug=${encodeURIComponent(slug)}`,
		},
		schema: EventCollectionSchema,
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
	return collection;
});

export const eventCollectionFactory = (slug: string) => factory.get(slug);
export const clearEventCollection = (slug?: string) => factory.clear(slug);
