import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import * as z from "zod";

import { CurrencySchema, IsoDateSchema, RepeatSchema } from "@hoalu/common/schema";

const SelectExpenseSchema = z.object({
	id: z.uuidv7(),
	title: z.string(),
	description: z.string().nullable(),
	amount: z.coerce.number(),
	currency: CurrencySchema,
	repeat: RepeatSchema,
	date: IsoDateSchema,
	wallet_id: z.uuidv7(),
	category_id: z.uuidv7(),
	creator_id: z.uuidv7(),
	created_at: IsoDateSchema,
});

export const expenseCollection = (id: string) => {
	return createCollection(
		electricCollectionOptions({
			getKey: (item) => item.id,
			shapeOptions: {
				url: new URL(`${import.meta.env.PUBLIC_API_URL}/sync`).toString(),
				params: {
					table: "expense",
					where: "workspace_id = $1",
					params: [id],
				},
				// @ts-expect-error
				fetchClient: (req: RequestInfo, init: RequestInit) => {
					return fetch(req, { ...init, credentials: "include" });
				},
			},
			schema: SelectExpenseSchema,
		}),
	);
};
