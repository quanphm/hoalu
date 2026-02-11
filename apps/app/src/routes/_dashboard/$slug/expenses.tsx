import {
	expenseCategoryFilterAtom,
	expenseRepeatFilterAtom,
	expenseWalletFilterAtom,
	mobileFilterExpandedAtom,
	searchKeywordsAtom,
} from "#app/atoms/index.ts";
import { useLiveQueryCategories } from "#app/components/categories/use-categories.ts";
import { CreateExpenseDialogTrigger } from "#app/components/expenses/expense-actions.tsx";
import { ExpenseDetails, MobileExpenseDetails } from "#app/components/expenses/expense-details.tsx";
import { ExpenseFilter, MobileFilterToggle } from "#app/components/expenses/expense-filter.tsx";
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
import { normalizeSearch } from "#app/helpers/normalize-search.ts";
import { datetime, toFromToDateObject } from "@hoalu/common/datetime";
import type { RepeatSchema } from "@hoalu/common/schema";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@hoalu/ui/drawer";
import { createFileRoute } from "@tanstack/react-router";
import { useAtom, useAtomValue } from "jotai";
import { useDeferredValue, useEffect } from "react";
import * as z from "zod";

const searchSchema = z.object({
	date: z.optional(z.string()),
});

export const Route = createFileRoute("/_dashboard/$slug/expenses")({
	validateSearch: searchSchema,
	component: RouteComponent,
});

function RouteComponent() {
	const { date: searchByDate } = Route.useSearch();
	const { shouldUseMobileLayout } = useLayoutMode();
	const expenses = useLiveQueryExpenses();
	const categories = useLiveQueryCategories();

	const range = toFromToDateObject(searchByDate);
	const searchKeywords = useAtomValue(searchKeywordsAtom);
	const selectedCategoryIds = useAtomValue(expenseCategoryFilterAtom);
	const selectedWalletIds = useAtomValue(expenseWalletFilterAtom);
	const selectedRepeat = useAtomValue(expenseRepeatFilterAtom);
	const deferredSearchKeywords = useDeferredValue(searchKeywords);

	const [isFilterExpanded, setIsFilterExpanded] = useAtom(mobileFilterExpandedAtom);

	// Reset filter drawer state when component unmounts
	useEffect(() => {
		return () => {
			setIsFilterExpanded(false);
		};
	}, [setIsFilterExpanded]);

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
				<SectionAction className="flex items-center gap-2">
					<MobileFilterToggle />
					<CreateExpenseDialogTrigger />
				</SectionAction>
			</SectionHeader>

			<SectionContent
				columns={12}
				className="h-[calc(100vh-84px)] gap-0 overflow-hidden max-md:h-[calc(100vh-84px-80px)]"
			>
				{/* Filter panel - hidden on mobile by default */}
				<SectionItem
					data-slot="expense-filter"
					desktopSpan="col-span-2"
					tabletSpan={1}
					mobileOrder={3}
					hideOnMobile
					className="pr-4 pb-4"
				>
					<ExpenseFilter expenses={filteredExpenses} categories={categories} />
				</SectionItem>

				{/* Expense list - full width on mobile */}
				<SectionItem
					data-slot="expense-list"
					desktopSpan="col-span-4"
					tabletSpan={1}
					mobileOrder={1}
				>
					<ExpenseList expenses={filteredExpenses} />
				</SectionItem>

				{/* Details panel - hidden on mobile, shown as drawer instead */}
				<SectionItem
					data-slot="expense-details"
					desktopSpan="col-span-6"
					tabletSpan={1}
					mobileOrder={2}
					hideOnMobile
				>
					<ExpenseDetails expenses={filteredExpenses} />
				</SectionItem>
			</SectionContent>

			{/* Mobile filter drawer */}
			{shouldUseMobileLayout && (
				<Drawer open={isFilterExpanded} onOpenChange={setIsFilterExpanded} direction="bottom">
					<DrawerContent className="h-[95vh] max-h-[95vh]">
						<DrawerHeader className="shrink-0 border-b">
							<DrawerTitle>Filters</DrawerTitle>
						</DrawerHeader>
						<div className="min-h-0 flex-1 overflow-y-auto p-4">
							<ExpenseFilter expenses={filteredExpenses} categories={categories} />
						</div>
						<div className="shrink-0 border-t p-4">
							<DrawerClose className="bg-primary text-primary-foreground w-full rounded-md py-2">
								Apply Filters
							</DrawerClose>
						</div>
					</DrawerContent>
				</Drawer>
			)}

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
		// Search by keywords (diacritic-insensitive, e.g. "an sang" matches "ăn sáng")
		if (searchKeywords) {
			const needle = normalizeSearch(searchKeywords);
			return (
				normalizeSearch(expense.title).includes(needle) ||
				normalizeSearch(expense.description).includes(needle)
			);
		}

		return true;
	});
}
