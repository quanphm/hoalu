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

export const categoryCollection = (slug: string) => {
	return createCollection(
		electricCollectionOptions({
			getKey: (item) => item.id,
			schema: CategoryCollectionSchema,
			shapeOptions: {
				url: `${import.meta.env.PUBLIC_API_URL}/sync/categories?workspaceIdOrSlug=${slug}`,
			},
		}),
	);
};
