import {
	type AmountFilterState,
	expenseAmountFilterAtom,
	expenseCategoryFilterAtom,
	expenseRepeatFilterAtom,
	expenseWalletFilterAtom,
	searchKeywordsAtom,
	transactionKindFilterAtom,
} from "#app/atoms/index.ts";
import { type SyncedExpense, useLiveQueryExpenses } from "#app/components/expenses/use-expenses.ts";
import { type SyncedIncome, useLiveQueryIncomes } from "#app/components/incomes/use-incomes.ts";
import { htmlToText } from "#app/helpers/dom-parser.ts";
import { useFuzzyFilter } from "#app/hooks/use-fuzzy-search.ts";
import { datetime, toFromToDateObject } from "@hoalu/common/datetime";
import { getRouteApi } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useDeferredValue, useMemo } from "react";

import type { RepeatSchema } from "@hoalu/common/schema";

export type SyncedTransaction =
	| (SyncedExpense & { kind: "expense" })
	| (SyncedIncome & { kind: "income" });

const transactionRouteApi = getRouteApi("/_dashboard/$slug/_toolbar-and-queue/transactions");

const getTransactionTextFields = (tx: SyncedTransaction) => [tx.title, htmlToText(tx.description)];
const getTransactionNumericValue = (tx: SyncedTransaction) => tx.realAmount;

export function useFilteredTransactions(): SyncedTransaction[] {
	const expenses = useLiveQueryExpenses();
	const incomes = useLiveQueryIncomes();
	const { date: searchByDate } = transactionRouteApi.useSearch();
	const range = toFromToDateObject(searchByDate);
	const searchKeywords = useAtomValue(searchKeywordsAtom);
	const selectedCategoryIds = useAtomValue(expenseCategoryFilterAtom);
	const selectedWalletIds = useAtomValue(expenseWalletFilterAtom);
	const selectedRepeat = useAtomValue(expenseRepeatFilterAtom);
	const amountFilter = useAtomValue(expenseAmountFilterAtom);
	const kindFilter = useAtomValue(transactionKindFilterAtom);
	const deferredSearchKeywords = useDeferredValue(searchKeywords);

	const merged = useMemo(() => {
		const taggedExpenses: SyncedTransaction[] =
			kindFilter === "income" ? [] : expenses.map((e) => ({ ...e, kind: "expense" as const }));
		const taggedIncomes: SyncedTransaction[] =
			kindFilter === "expense" ? [] : incomes.map((i) => ({ ...i, kind: "income" as const }));
		return [...taggedExpenses, ...taggedIncomes].sort((a, b) => {
			if (b.date !== a.date) return b.date.localeCompare(a.date);
			return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
		});
	}, [expenses, incomes, kindFilter]);

	const structurallyFiltered = useMemo(
		() => filterTransactions(merged, { selectedCategoryIds, selectedWalletIds, selectedRepeat, range, amountFilter }),
		[merged, selectedCategoryIds, selectedWalletIds, selectedRepeat, range, amountFilter],
	);

	return useFuzzyFilter(structurallyFiltered, deferredSearchKeywords, {
		getTextFields: getTransactionTextFields,
		getNumericValue: getTransactionNumericValue,
	});
}

function filterTransactions(
	data: SyncedTransaction[],
	condition: {
		selectedCategoryIds: string[];
		selectedWalletIds: string[];
		selectedRepeat: RepeatSchema[];
		range: { from: Date; to: Date } | undefined;
		amountFilter: AmountFilterState;
	},
): SyncedTransaction[] {
	const { selectedCategoryIds, selectedWalletIds, selectedRepeat, range, amountFilter } = condition;

	const fromDate = range ? datetime.format(range.from, "yyyy-MM-dd") : undefined;
	const toDate = range ? datetime.format(range.to, "yyyy-MM-dd") : undefined;

	return data.filter((tx) => {
		if (fromDate && toDate) {
			if (tx.date < fromDate || tx.date > toDate) return false;
		}
		if (selectedCategoryIds.length > 0) {
			const categoryId = tx.category?.id;
			if (!categoryId || !selectedCategoryIds.includes(categoryId)) return false;
		}
		if (selectedWalletIds.length > 0) {
			const walletId = tx.wallet?.id;
			if (!walletId || !selectedWalletIds.includes(walletId)) return false;
		}
		if (selectedRepeat.length > 0) {
			if (!selectedRepeat.includes(tx.repeat)) return false;
		}
		if (amountFilter.min !== null || amountFilter.max !== null) {
			const amount = tx.realAmount;
			if (amountFilter.min !== null && amount < amountFilter.min) return false;
			if (amountFilter.max !== null && amount > amountFilter.max) return false;
		}
		return true;
	});
}
