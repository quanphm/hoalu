import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import * as z from "zod";

import { ColorSchema } from "@hoalu/common/schema";

import { createCollectionFactory } from "#app/lib/collections/create-collection-factory.ts";

const CategoryCollectionSchema = z.object({
	id: z.uuidv7(),
	name: z.string(),
	description: z.string().nullable(),
	color: ColorSchema,
});

const factory = createCollectionFactory("category", (slug: string) =>
	createCollection(
		electricCollectionOptions({
			id: `category-${slug}`,
			getKey: (item) => item.id,
			shapeOptions: {
				url: `${import.meta.env.PUBLIC_API_URL}/sync/categories?workspaceIdOrSlug=${encodeURIComponent(slug)}`,
			},
			schema: CategoryCollectionSchema,
		}),
	),
);

export const categoryCollectionFactory = factory.get;
export const clearCategoryCollection = factory.clear;
