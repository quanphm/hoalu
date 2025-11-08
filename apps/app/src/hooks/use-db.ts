import { count, eq, useLiveQuery } from "@tanstack/react-db";
import { useMemo } from "react";

import { datetime } from "@hoalu/common/datetime";
import { monetary } from "@hoalu/common/monetary";

import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { categoryCollection } from "#app/lib/collections/category.ts";
import { expenseCollection } from "#app/lib/collections/expense.ts";
import { walletCollection } from "#app/lib/collections/wallet.ts";

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
				...expense,
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

	const transformedExpenses = useMemo(() => {
		if (!expenses) return [];

		return expenses.map((expense) => ({
			...expense,
			date: datetime.format(expense.date, "yyyy-MM-dd"),
			amount: monetary.fromRealAmount(Number(expense.amount), expense.currency),
			realAmount: Number(expense.amount),
			convertedAmount: Number(expense.amount),
		}));
	}, [expenses]);

	return transformedExpenses;
}

export type ExpensesClient = ReturnType<typeof useExpenseLiveQuery>;
export type ExpenseClient = ExpensesClient[number];

export function useCategoryLiveQuery() {
	const workspace = useWorkspace();
	const { data: categories } = useLiveQuery(
		(q) => {
			return q
				.from({ category: categoryCollection(workspace.id) })
				.leftJoin({ expense: expenseCollection(workspace.id) }, ({ category, expense }) =>
					eq(category.id, expense.category_id),
				)
				.groupBy(({ category }) => [
					category.id,
					category.name,
					category.description,
					category.color,
				])
				.select(({ category }) => ({
					id: category.id,
					name: category.name,
					description: category.description,
					color: category.color,
					total: count(category.id),
				}));
		},
		[workspace.id],
	);

	return categories;
}

export function useWalletLiveQuery() {
	const workspace = useWorkspace();
	const { data: wallets } = useLiveQuery(
		(q) => {
			return q
				.from({ wallet: walletCollection(workspace.id) })
				.innerJoin({ expense: expenseCollection(workspace.id) }, ({ wallet, expense }) =>
					eq(wallet.id, expense.wallet_id),
				)
				.select(({ wallet }) => wallet);
		},
		[workspace.id],
	);

	return wallets;
}
