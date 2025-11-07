import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import * as z from "zod";

import { ColorSchema, CurrencySchema, RepeatSchema, WalletTypeSchema } from "@hoalu/common/schema";

export const SelectExpenseSchema = z.object({
	id: z.uuidv7(),
	title: z.string(),
	description: z.string().nullable(),
	amount: z.coerce.number(),
	currency: CurrencySchema,
	repeat: RepeatSchema,
	date: z.string().transform((d) => new Date(d).toISOString()),
	wallet_id: z.uuidv7(),
	category_id: z.uuidv7(),
	creator_id: z.uuidv7(),
	created_at: z.string().transform((d) => new Date(d).toISOString()),
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

const SelectWalletSchema = z.object({
	id: z.uuidv7(),
	name: z.string(),
	description: z.string().nullable(),
	currency: CurrencySchema,
	type: WalletTypeSchema,
	is_active: z.boolean(),
});

export const walletCollection = (id: string) => {
	return createCollection(
		electricCollectionOptions({
			getKey: (item) => item.id,
			schema: SelectWalletSchema,
			shapeOptions: {
				url: new URL(`${import.meta.env.PUBLIC_API_URL}/sync`).toString(),
				params: {
					table: "wallet",
					where: "workspace_id = $1",
					params: [id],
				},
				// @ts-expect-error
				fetchClient: (req: RequestInfo, init: RequestInit) => {
					return fetch(req, { ...init, credentials: "include" });
				},
			},
		}),
	);
};
