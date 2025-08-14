import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import memoize from "fast-memoize";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect } from "react";

import { datetime, toFromToDateObject } from "@hoalu/common/datetime";
import { expenseCategoryFilterAtom, expenseWalletFilterAtom, selectedExpenseAtom } from "@/atoms";
import type { ExpenseWithClientConvertedSchema } from "@/lib/schema";
import { playClickSound } from "@/lib/sound-effects";
import { expensesQueryOptions } from "@/services/query-options";
import { useWorkspace } from "./use-workspace";

const routeApi = getRouteApi("/_dashboard/$slug/expenses");

const select = memoize(
	(
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
		return data
			.map((expense) => {
				return {
					...expense,
					date: datetime.format(expense.date, "yyyy-MM-dd"),
				} as ExpenseWithClientConvertedSchema;
			})
			.filter((expense) => {
				let filterResult = true;

				if (range) {
					const fromDate = datetime.format(range.from, "yyyy-MM-dd");
					const toDate = datetime.format(range.to, "yyyy-MM-dd");
					const expenseDate = datetime.format(expense.date, "yyyy-MM-dd");
					filterResult = expenseDate >= fromDate && expenseDate <= toDate;
				}

				if (selectedCategoryIds.length > 0) {
					const categoryId = expense.category?.id || "";
					filterResult = filterResult && selectedCategoryIds.includes(categoryId);
				}

				if (selectedWalletIds.length > 0) {
					const walletId = expense.wallet?.id || "";
					filterResult = filterResult && selectedWalletIds.includes(walletId);
				}

				return filterResult;
			});
	},
);

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

	useEffect(() => {
		if (!selectedExpense.id) {
			return;
		}
		playClickSound();
	}, [selectedExpense.id]);

	return { data, currentIndex };
}

export function useSelectedExpense() {
	const [expense, setSelectedExpense] = useAtom(selectedExpenseAtom);
	const onSelectExpense = useCallback((id: string | null) => {
		setSelectedExpense({ id });
	}, []);

	return { expense, onSelectExpense };
}
