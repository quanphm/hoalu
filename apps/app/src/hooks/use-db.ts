import { eq, useLiveQuery } from "@tanstack/react-db";
import * as z from "zod";

import { datetime } from "@hoalu/common/datetime";
import { monetary } from "@hoalu/common/monetary";
import {
	ColorSchema,
	CurrencySchema,
	IsoDateSchema,
	RepeatSchema,
	WalletTypeSchema,
} from "@hoalu/common/schema";

import { useWorkspace } from "#app/hooks/use-workspace.ts";
import {
	categoryCollection,
	expenseCollection,
	walletCollection,
} from "#app/services/collections.ts";

const ExpenseSchema = z
	.object({
		id: z.uuidv7(),
		title: z.string(),
		description: z.string().nullable(),
		amount: z.coerce.number(),
		currency: CurrencySchema,
		repeat: RepeatSchema,
		date: IsoDateSchema,
		createdAt: IsoDateSchema,
		wallet: z.object({
			id: z.uuidv7(),
			name: z.string(),
			description: z.string().nullable(),
			currency: CurrencySchema,
			type: WalletTypeSchema,
			isActive: z.boolean(),
		}),
		category: z
			.object({
				id: z.uuidv7(),
				name: z.string(),
				description: z.string().nullable(),
				color: ColorSchema,
			})
			.nullable(),
	})
	.transform((val) => ({
		...val,
		date: datetime.format(val.date, "yyyy-MM-dd"),
		amount: monetary.fromRealAmount(val.amount, val.currency),
		realAmount: val.amount,
		convertedAmount: val.amount,
	}));

export function useExpenseLiveQuery() {
	const workspace = useWorkspace();

	const { data: expenses } = useLiveQuery((q) =>
		q
			.from({ expense: expenseCollection(workspace.id) })
			.innerJoin({ wallet: walletCollection(workspace.id) }, ({ expense, wallet }) =>
				eq(expense.wallet_id, wallet.id),
			)
			.leftJoin({ category: categoryCollection(workspace.id) }, ({ expense, category }) =>
				eq(expense.category_id, category.id),
			)
			.orderBy(({ expense }) => expense.date, "desc")
			.orderBy(({ expense }) => expense.amount, "desc")
			.select(({ expense, wallet, category }) => ({
				id: expense.id,
				title: expense.title,
				description: expense.description,
				date: expense.date,
				amount: expense.amount,
				currency: expense.currency,
				repeat: expense.repeat,
				createdAt: expense.created_at,
				category: {
					id: category?.id,
					name: category?.name,
					description: category?.description,
					color: category?.color,
				},
				wallet: {
					id: wallet.id,
					name: wallet.name,
					description: wallet.description,
					currency: wallet.currency,
					type: wallet.type,
					isActive: wallet.is_active,
				},
			})),
	);

	const parsed = z.array(ExpenseSchema).safeParse(expenses);

	if (parsed.error) {
		return [];
	}

	return parsed.data;
}
