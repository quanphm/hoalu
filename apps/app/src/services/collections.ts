import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import * as z from "zod";

const ExpenseFormSchema = z.object({
	id: z.uuidv7(),
	title: z.string(),
	description: z.optional(z.string()),
	date: z.iso.datetime(),
	walletId: z.uuidv7(),
	categoryId: z.uuidv7(),
});

export const expenseCollection = (id: string) =>
	createCollection(
		electricCollectionOptions({
			getKey: (item) => item.id,
			schema: ExpenseFormSchema,
			shapeOptions: {
				url: `${import.meta.env.PUBLIC_API_URL}/sync`,
				params: {
					table: "expense",
					where: `workspace_id = '${id}'`,
				},
				// @ts-expect-error
				fetchClient: (req: RequestInfo, init: RequestInit) =>
					fetch(req, { ...init, credentials: "include" }),
			},
		}),
	);
