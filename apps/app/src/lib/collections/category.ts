import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import * as z from "zod";

import { ColorSchema } from "@hoalu/common/schema";

const SelectCategorySchema = z.object({
	id: z.uuidv7(),
	name: z.string(),
	description: z.string().nullable(),
	color: ColorSchema,
});

export const categoryCollection = (id: string) => {
	return createCollection(
		// @ts-expect-error
		electricCollectionOptions({
			getKey: (item) => item.id,
			schema: SelectCategorySchema,
			shapeOptions: {
				url: new URL(`${import.meta.env.PUBLIC_API_URL}/sync`).toString(),
				params: {
					table: "category",
					where: "workspace_id = $1",
					params: [id],
				},
				parser: {
					timestamptz: (date: string) => new Date(date),
				},
				fetchClient: (req: RequestInfo, init: RequestInit) => {
					return fetch(req, { ...init, credentials: "include" });
				},
			},
		}),
	);
};
