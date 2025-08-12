import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect } from "react";

import { datetime, toFromToDateObject } from "@hoalu/common/datetime";
import { expenseCategoryFilterAtom, expenseWalletFilterAtom, selectedExpenseAtom } from "@/atoms";
import type { ExpenseWithClientConvertedSchema } from "@/lib/schema";
import { clickSound, soundSafePlay } from "@/lib/sound-effects";
import { expensesQueryOptions } from "@/services/query-options";
import { useWorkspace } from "./use-workspace";

const routeApi = getRouteApi("/_dashboard/$slug/expenses");

export function useExpenses() {
	const { date: searchByDate } = routeApi.useSearch();
	const { slug } = useWorkspace();

	const { data } = useSuspenseQuery({
		...expensesQueryOptions(slug),
		select: (expenses) => {
			return expenses.map((expense) => {
				return {
					...expense,
					date: datetime.format(expense.date, "yyyy-MM-dd"),
				} as ExpenseWithClientConvertedSchema;
			});
		},
	});
	const [selectedExpense, setSelectedExpense] = useAtom(selectedExpenseAtom);
	const selectedCategoryIds = useAtomValue(expenseCategoryFilterAtom);
	const selectedWalletIds = useAtomValue(expenseWalletFilterAtom);

	const expenseList = data.filter((expense) => {
		let filterResult = true;

		const range = toFromToDateObject(searchByDate);
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

	const currentIndex = expenseList.findIndex((item) => item.id === selectedExpense.id);

	const onSelectExpense = useCallback((id: string | null) => {
		setSelectedExpense({ id });
	}, []);

	useEffect(() => {
		if (!selectedExpense.id) {
			return;
		}
		soundSafePlay(clickSound);
	}, [selectedExpense.id]);

	return { data: expenseList, currentIndex, onSelectExpense };
}
