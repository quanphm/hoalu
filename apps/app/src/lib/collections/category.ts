import { ColorSchema } from "@hoalu/schema/schema";
import { persistedCollectionOptions } from "@tanstack/browser-db-sqlite-persistence";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import * as z from "zod";

import { createCollectionFactory } from "#app/lib/collections/create-collection-factory.ts";
import {
	getPersistence,
	INITIAL_RENDER,
	SCHEMA_VERSION,
} from "#app/lib/collections/persistence.ts";

const CategoryCollectionSchema = z.object({
	id: z.uuidv7(),
	name: z.string(),
	description: z.string().nullable(),
	type: z.enum(["expense", "income"]),
	color: ColorSchema,
});

const factory = createCollectionFactory("category", (slug: string) => {
	const options = electricCollectionOptions({
		id: `category-${slug}`,
		getKey: (item) => item.id,
		shapeOptions: {
			url: `${import.meta.env.PUBLIC_API_URL}/sync/categories?workspaceIdOrSlug=${encodeURIComponent(slug)}`,
		},
		schema: CategoryCollectionSchema,
	});

	const persistence = getPersistence();
	if (!persistence) {
		return createCollection(options);
	}

	return createCollection(
		persistedCollectionOptions({
			...options,
			persistence,
			schemaVersion: SCHEMA_VERSION,
			initialRender: INITIAL_RENDER,
		}),
	);
});

export const categoryCollectionFactory = factory.get;
export const clearCategoryCollection = factory.clear;
