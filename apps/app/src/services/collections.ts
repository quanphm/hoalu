import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import { type } from "arktype";

const ExpenseFormSchema = type({
	id: "string.uuid.v7",
	title: "string",
	"description?": "string",
	date: "string.date.iso",
	walletId: "string.uuid.v7",
	categoryId: "string.uuid.v7",
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
