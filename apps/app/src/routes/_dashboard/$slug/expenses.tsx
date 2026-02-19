import {
	type AmountFilterState,
	expenseAmountFilterAtom,
	expenseCategoryFilterAtom,
	expenseRepeatFilterAtom,
	expenseWalletFilterAtom,
	searchKeywordsAtom,
	selectedExpenseAtom,
} from "#app/atoms/index.ts";
import { CreateExpenseDialogTrigger } from "#app/components/expenses/expense-actions.tsx";
import { ExpenseDetails, MobileExpenseDetails } from "#app/components/expenses/expense-details.tsx";
import { ExpenseFilterDropdown } from "#app/components/expenses/expense-filter-dropdown.tsx";
import ExpenseList from "#app/components/expenses/expense-list.tsx";
import { type SyncedExpense, useLiveQueryExpenses } from "#app/components/expenses/use-expenses.ts";
import {
	Section,
	SectionAction,
	SectionContent,
	SectionHeader,
	SectionItem,
	SectionTitle,
} from "#app/components/layouts/section.tsx";
import { useLayoutMode } from "#app/components/layouts/use-layout-mode.ts";
import { matchesSearch } from "#app/helpers/normalize-search.ts";
import { datetime, toFromToDateObject } from "@hoalu/common/datetime";
import type { RepeatSchema } from "@hoalu/common/schema";
import { createFileRoute } from "@tanstack/react-router";
import { useAtom, useAtomValue } from "jotai";
import { useDeferredValue, useEffect } from "react";
import * as z from "zod";

const searchSchema = z.object({
	date: z.optional(z.string()),
	id: z.optional(z.string()),
});

export const Route = createFileRoute("/_dashboard/$slug/expenses")({
	validateSearch: searchSchema,
	component: RouteComponent,
});

function RouteComponent() {
	const { date: searchByDate, id: searchById } = Route.useSearch();
	const navigate = Route.useNavigate();

	const { shouldUseMobileLayout } = useLayoutMode();
	const expenses = useLiveQueryExpenses();

	const range = toFromToDateObject(searchByDate);
	const searchKeywords = useAtomValue(searchKeywordsAtom);
	const selectedCategoryIds = useAtomValue(expenseCategoryFilterAtom);
	const selectedWalletIds = useAtomValue(expenseWalletFilterAtom);
	const selectedRepeat = useAtomValue(expenseRepeatFilterAtom);
	const amountFilter = useAtomValue(expenseAmountFilterAtom);
	const deferredSearchKeywords = useDeferredValue(searchKeywords);

	const [_, setSelectedExpense] = useAtom(selectedExpenseAtom);

	useEffect(() => {
		if (searchById) {
			setSelectedExpense({ id: searchById });
			navigate({ search: (prev) => ({ ...prev, id: undefined }), replace: true });
		}
	}, [searchById, setSelectedExpense, navigate]);

	const filteredExpenses = filter(expenses, {
		selectedCategoryIds,
		selectedWalletIds,
		selectedRepeat,
		searchKeywords: deferredSearchKeywords,
		range,
		amountFilter,
	});

	return (
		<Section className="-mb-8">
			<SectionHeader>
				<SectionTitle>Expenses</SectionTitle>
				<SectionAction className="flex items-center gap-2">
					<CreateExpenseDialogTrigger />
				</SectionAction>
			</SectionHeader>

			<ExpenseFilterDropdown />

			<SectionContent
				columns={12}
				className="h-[calc(100vh-84px-68px)] gap-0 overflow-hidden max-md:h-[calc(100vh-84px-68px)]"
			>
				{/* <SectionItem
					data-slot="expense-filter"
					desktopSpan="col-span-2"
					tabletSpan={1}
					mobileOrder={3}
					hideOnMobile
					className="pr-4 pb-4"
				>
					<ExpenseFilter expenses={filteredExpenses} categories={categories} />
				</SectionItem> */}

				{/* Expense list - full width on mobile */}
				<SectionItem
					data-slot="expense-list"
					desktopSpan="col-span-5"
					tabletSpan={1}
					mobileOrder={1}
				>
					<ExpenseList expenses={filteredExpenses} />
				</SectionItem>

				{/* Details panel - hidden on mobile, shown as drawer instead */}
				<SectionItem
					data-slot="expense-details"
					desktopSpan="col-span-7"
					tabletSpan={1}
					mobileOrder={2}
					hideOnMobile
				>
					<ExpenseDetails expenses={filteredExpenses} />
				</SectionItem>
			</SectionContent>

			{/* Mobile expense details drawer */}
			{shouldUseMobileLayout && <MobileExpenseDetails expenses={filteredExpenses} />}
		</Section>
	);
}

function filter(
	data: SyncedExpense[],
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
		amountFilter: AmountFilterState;
	},
) {
	const {
		selectedCategoryIds,
		selectedWalletIds,
		selectedRepeat,
		searchKeywords,
		range,
		amountFilter,
	} = condition;
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
		// Amount filter
		if (amountFilter.min !== null || amountFilter.max !== null) {
			const amount = expense.realAmount;
			if (amountFilter.min !== null && amount < amountFilter.min) {
				return false;
			}
			if (amountFilter.max !== null && amount > amountFilter.max) {
				return false;
			}
		}
		// Search by keywords (multi-term, diacritic-insensitive)
		// e.g., "kem 64" matches expenses with "kem" in title AND "64" in amount
		if (searchKeywords) {
			return matchesSearch(searchKeywords, {
				textFields: [expense.title, expense.description],
				numericFields: [expense.realAmount],
			});
		}

		return true;
	});
}
