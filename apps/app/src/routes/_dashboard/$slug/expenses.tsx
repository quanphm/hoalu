import { createFileRoute } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useDeferredValue } from "react";
import * as z from "zod";

import { datetime, toFromToDateObject } from "@hoalu/common/datetime";
import type { RepeatSchema } from "@hoalu/common/schema";

import {
	expenseCategoryFilterAtom,
	expenseRepeatFilterAtom,
	expenseWalletFilterAtom,
	searchKeywordsAtom,
} from "#app/atoms/index.ts";
import { CreateExpenseDialogTrigger } from "#app/components/expenses/expense-actions.tsx";
import { ExpenseDetails } from "#app/components/expenses/expense-details.tsx";
import { ExpenseFilter } from "#app/components/expenses/expense-filter.tsx";
import ExpenseList from "#app/components/expenses/expense-list.tsx";
import {
	Section,
	SectionContent,
	SectionHeader,
	SectionItem,
	SectionTitle,
} from "#app/components/layouts/section.tsx";
import { type ExpenseClient, useLiveQueryExpenses } from "#app/hooks/use-db.ts";

const searchSchema = z.object({
	date: z.optional(z.string()),
});

export const Route = createFileRoute("/_dashboard/$slug/expenses")({
	validateSearch: searchSchema,
	component: RouteComponent,
});

function RouteComponent() {
	const { date: searchByDate } = Route.useSearch();
	const expenses = useLiveQueryExpenses();

	const range = toFromToDateObject(searchByDate);
	const searchKeywords = useAtomValue(searchKeywordsAtom);
	const selectedCategoryIds = useAtomValue(expenseCategoryFilterAtom);
	const selectedWalletIds = useAtomValue(expenseWalletFilterAtom);
	const selectedRepeat = useAtomValue(expenseRepeatFilterAtom);
	const deferredSearchKeywords = useDeferredValue(searchKeywords);

	const filteredExpenses = filter(expenses, {
		selectedCategoryIds,
		selectedWalletIds,
		selectedRepeat,
		searchKeywords: deferredSearchKeywords,
		range,
	});

	return (
		<Section className="-mb-8">
			<SectionHeader>
				<SectionTitle>Expenses</SectionTitle>
				<CreateExpenseDialogTrigger />
			</SectionHeader>

			<SectionContent columns={12} className="h-[calc(100vh-76px)] gap-0 overflow-hidden">
				<SectionItem
					data-slot="expense-filter"
					desktopSpan="col-span-2"
					tabletSpan={1}
					mobileOrder={3}
					className="pr-4 pb-4"
				>
					<ExpenseFilter />
				</SectionItem>

				<SectionItem
					data-slot="expense-list"
					desktopSpan="col-span-4"
					tabletSpan={1}
					mobileOrder={1}
				>
					<ExpenseList data={filteredExpenses} />
				</SectionItem>

				<SectionItem
					data-slot="expense-details"
					desktopSpan="col-span-6"
					tabletSpan={1}
					mobileOrder={2}
				>
					<ExpenseDetails expenses={filteredExpenses} />
				</SectionItem>
			</SectionContent>
		</Section>
	);
}

function filter(
	data: ExpenseClient[],
	condition: {
		selectedCategoryIds: string[];
		selectedWalletIds: string[];
		selectedRepeat: RepeatSchema[];
		searchKeywords: string;
		range:
			| {
					from: Date;
					to: Date;
			  }
			| undefined;
	},
) {
	const { selectedCategoryIds, selectedWalletIds, selectedRepeat, searchKeywords, range } =
		condition;
	const fromDate = range ? datetime.format(range.from, "yyyy-MM-dd") : undefined;
	const toDate = range ? datetime.format(range.to, "yyyy-MM-dd") : undefined;

	return data.filter((expense) => {
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
		// Repeat filter
		if (selectedRepeat.length > 0) {
			if (!selectedRepeat.includes(expense.repeat)) {
				return false;
			}
		}
		// Search by keywords
		if (searchKeywords) {
			return expense.title.toLowerCase().includes(searchKeywords.toLowerCase());
		}

		return true;
	});
}
