import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useAtom, useAtomValue } from "jotai";
import { useCallback } from "react";

import { datetime, toFromToDateObject } from "@hoalu/common/datetime";
import {
	expenseCategoryFilterAtom,
	expenseWalletFilterAtom,
	searchKeywordsAtom,
	selectedExpenseAtom,
} from "@/atoms";
import { formatCurrency } from "@/helpers/currency";
import type { ExpenseWithClientConvertedSchema } from "@/lib/schema";
import {
	categoriesQueryOptions,
	expensesQueryOptions,
	walletsQueryOptions,
} from "@/services/query-options";
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
	searchKeywords: string,
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
			// Search by keywords
			if (searchKeywords) {
				return expense.title.toLowerCase().includes(searchKeywords.toLowerCase());
			}

			return true;
		});
};

export function useExpenses() {
	const { date: searchByDate } = routeApi.useSearch();
	const { slug } = useWorkspace();

	const range = toFromToDateObject(searchByDate);
	const searchKeywords = useAtomValue(searchKeywordsAtom);
	const selectedCategoryIds = useAtomValue(expenseCategoryFilterAtom);
	const selectedWalletIds = useAtomValue(expenseWalletFilterAtom);

	const { data } = useSuspenseQuery({
		...expensesQueryOptions(slug),
		select: useCallback(
			(expenses: ExpenseWithClientConvertedSchema[]) => {
				return select(expenses, selectedCategoryIds, selectedWalletIds, range, searchKeywords);
			},
			[selectedCategoryIds, selectedWalletIds, range, searchKeywords],
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

export function useExpenseStats() {
	const { slug } = useWorkspace();
	const {
		metadata: { currency },
	} = useWorkspace();
	const { data: expenses } = useSuspenseQuery(expensesQueryOptions(slug));
	const { data: categories } = useSuspenseQuery(categoriesQueryOptions(slug));
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(slug));

	let totalAmount = 0;
	for (const expense of expenses) {
		const amount = expense.convertedAmount <= 0 ? 0 : expense.convertedAmount;
		totalAmount += amount;
	}

	const categoryCount: Record<string, number> = {};
	for (const category of categories) {
		categoryCount[category.id] = category.total;
	}

	const walletCount: Record<string, number> = {};
	for (const wallet of wallets) {
		walletCount[wallet.id] = wallet.total;
	}

	return {
		amount: {
			total: formatCurrency(totalAmount, currency),
		},
		transactions: {
			total: expenses.length,
			byCategory: categoryCount,
			byWallet: walletCount,
		},
	};
}
