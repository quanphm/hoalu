import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import * as z from "zod";

import { ColorSchema } from "@hoalu/common/schema";

const CategoryCollectionSchema = z.object({
	id: z.uuidv7(),
	name: z.string(),
	description: z.string().nullable(),
	color: ColorSchema,
});

const collectionCreateHelper = (slug: string) =>
	createCollection(
		electricCollectionOptions({
			id: `category-${slug}`,
			getKey: (item) => item.id,
			shapeOptions: {
				url: `${import.meta.env.PUBLIC_API_URL}/sync/categories?workspaceIdOrSlug=${slug}`,
			},
			schema: CategoryCollectionSchema,
		}),
	);

type CategoryCollection = ReturnType<typeof collectionCreateHelper>;

const instances = new Map<string, CategoryCollection>();

export function categoryCollectionFactory(slug: string) {
	if (instances.has(slug)) {
		return instances.get(slug) as CategoryCollection;
	}

	const collection = collectionCreateHelper(slug);
	instances.set(slug, collection);

	return collection;
}
