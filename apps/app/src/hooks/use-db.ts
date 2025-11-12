import { count, eq, useLiveQuery } from "@tanstack/react-db";
import { useMemo } from "react";

import { datetime } from "@hoalu/common/datetime";
import { monetary } from "@hoalu/common/monetary";

import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { categoryCollection } from "#app/lib/collections/category.ts";
import { expenseCollection } from "#app/lib/collections/expense.ts";
import { walletCollection } from "#app/lib/collections/wallet.ts";

export function useLiveQueryExpenses() {
	const workspace = useWorkspace();

	const { data } = useLiveQuery(
		(q) => {
			return q
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
						color: category?.color,
					},
					wallet: {
						id: wallet.id,
						name: wallet.name,
						type: wallet.type,
					},
				}));
		},
		[workspace.id],
	);

	const transformedExpenses = useMemo(() => {
		if (!data) return [];

		return data.map((expense) => ({
			...expense,
			date: datetime.format(expense.date, "yyyy-MM-dd"),
			amount: monetary.fromRealAmount(Number(expense.amount), expense.currency),
			realAmount: Number(expense.amount),
			convertedAmount: Number(expense.amount),
		}));
	}, [data]);

	return transformedExpenses;
}

export type ExpensesClient = ReturnType<typeof useLiveQueryExpenses>;
export type ExpenseClient = ExpensesClient[number];

export function useLiveQueryExpenseById(id: string | null) {
	const workspace = useWorkspace();

	const { data } = useLiveQuery(
		(q) => {
			if (!id) return undefined;

			return q
				.from({ expense: expenseCollection(workspace.id) })
				.innerJoin({ wallet: walletCollection(workspace.id) }, ({ expense, wallet }) =>
					eq(expense.wallet_id, wallet.id),
				)
				.leftJoin({ category: categoryCollection(workspace.id) }, ({ expense, category }) =>
					eq(expense.category_id, category.id),
				)
				.where(({ expense }) => eq(expense.id, id))
				.findOne()
				.select(({ expense, wallet, category }) => ({
					...expense,
					category: {
						id: category?.id,
						name: category?.name,
						color: category?.color,
					},
					wallet: {
						id: wallet.id,
						name: wallet.name,
						type: wallet.type,
					},
				}));
		},
		[id],
	);

	const transformedExpense = useMemo(() => {
		if (!data) return null;

		return {
			...data,
			date: datetime.format(data.date, "yyyy-MM-dd"),
			amount: monetary.fromRealAmount(Number(data.amount), data.currency),
			realAmount: Number(data.amount),
			convertedAmount: Number(data.amount),
		};
	}, [data]);

	return transformedExpense;
}

export function useLiveQueryCategory() {
	const workspace = useWorkspace();
	const { data } = useLiveQuery(
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

	return data;
}

export function useLiveQueryWallet() {
	const workspace = useWorkspace();
	const { data } = useLiveQuery(
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

	return data;
}
