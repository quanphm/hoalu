import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect } from "react";

import { datetime, toFromToDateObject } from "@hoalu/common/datetime";
import { expenseCategoryFilterAtom, expenseWalletFilterAtom, selectedExpenseAtom } from "@/atoms";
import type { ExpenseWithClientConvertedSchema } from "@/lib/schema";
import { expensesQueryOptions } from "@/services/query-options";
import { useWorkspace } from "./use-workspace";

const routeApi = getRouteApi("/_dashboard/$slug/expenses");

const select = (
	data: ExpenseWithClientConvertedSchema[],
	selectedCategoryIds: string[],
	selectedWalletIds: string[],
	range:
		| {
				from: Date;
				to: Date;
		  }
		| undefined,
) => {
	const fromDate = range ? datetime.format(range.from, "yyyy-MM-dd") : undefined;
	const toDate = range ? datetime.format(range.to, "yyyy-MM-dd") : undefined;

	return data
		.map((expense) => {
			return {
				...expense,
				date: datetime.format(expense.date, "yyyy-MM-dd"),
			} as ExpenseWithClientConvertedSchema;
		})
		.filter((expense) => {
			// Date range filter
			if (fromDate && toDate) {
				if (expense.date < fromDate || expense.date > toDate) {
					return false;
				}
			}
			// Category filter
			if (selectedCategoryIds.length > 0) {
				const categoryId = expense.category?.id;
				if (!categoryId || !selectedCategoryIds.includes(categoryId)) {
					return false;
				}
			}
			// Wallet filter
			if (selectedWalletIds.length > 0) {
				const walletId = expense.wallet?.id;
				if (!walletId || !selectedWalletIds.includes(walletId)) {
					return false;
				}
			}

			return true;
		});
};

export function useExpenses() {
	const { date: searchByDate } = routeApi.useSearch();
	const { slug } = useWorkspace();

	const range = toFromToDateObject(searchByDate);
	const selectedCategoryIds = useAtomValue(expenseCategoryFilterAtom);
	const selectedWalletIds = useAtomValue(expenseWalletFilterAtom);

	const { data } = useSuspenseQuery({
		...expensesQueryOptions(slug),
		select: useCallback(
			(expenses: ExpenseWithClientConvertedSchema[]) => {
				return select(expenses, selectedCategoryIds, selectedWalletIds, range);
			},
			[selectedCategoryIds, selectedWalletIds, range],
		),
	});

	const selectedExpense = useAtomValue(selectedExpenseAtom);
	const currentIndex = data.findIndex((item) => item.id === selectedExpense.id);

	return { data, currentIndex };
}

export function useSelectedExpense() {
	const [expense, setSelectedExpense] = useAtom(selectedExpenseAtom);
	const onSelectExpense = useCallback((id: string | null) => {
		setSelectedExpense({ id });
	}, []);

	return { expense, onSelectExpense };
}
