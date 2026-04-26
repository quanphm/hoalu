import { type AmountFilterState } from "#app/atoms/filters.ts";
import {
	incomeAmountFilterAtom,
	incomeCategoryFilterAtom,
	incomeWalletFilterAtom,
	incomeSearchKeywordsAtom,
} from "#app/atoms/index.ts";
import { CreateExpenseDialogTrigger } from "#app/components/expenses/expense-actions.tsx";
import { CreateIncomeDialogTrigger } from "#app/components/incomes/income-actions.tsx";
import { IncomeDetails, MobileIncomeDetails } from "#app/components/incomes/income-details.tsx";
import { IncomeFilterDropdown } from "#app/components/incomes/income-filter-dropdown.tsx";
import IncomeList from "#app/components/incomes/income-list.tsx";
import {
	type SyncedIncome,
	useLiveQueryIncomes,
	useSelectedIncome,
} from "#app/components/incomes/use-incomes.ts";
import { PageContent } from "#app/components/layouts/page-content.tsx";
import { Section, SectionContent, SectionItem } from "#app/components/layouts/section.tsx";
import {
	Toolbar,
	ToolbarActions,
	ToolbarGroup,
	ToolbarSeparator,
	ToolbarTitle,
} from "#app/components/layouts/toolbar.tsx";
import { useLayoutMode } from "#app/components/layouts/use-layout-mode.ts";
import { QuickExpensesDialogTrigger } from "#app/components/quick-expenses/quick-expenses-dialog.tsx";
import { ScanReceiptDialogTrigger } from "#app/components/receipt/scan-receipt-dialog.tsx";
import { RedactedAmountToggle } from "#app/components/redacted-amount-toggle.tsx";
import { matchesSearch } from "#app/helpers/normalize-search.ts";
import { toFromToDateObject } from "@hoalu/common/datetime";
import { createFileRoute } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useDeferredValue, useEffect } from "react";
import * as z from "zod";

const searchSchema = z.object({
	date: z.optional(z.string()),
	id: z.optional(z.string()),
});

export const Route = createFileRoute("/_dashboard/$slug/incomes")({
	validateSearch: searchSchema,
	component: RouteComponent,
});

function RouteComponent() {
	const { id: searchById, date: searchByDate } = Route.useSearch();

	const { shouldUseMobileLayout } = useLayoutMode();
	const incomes = useLiveQueryIncomes();

	const searchKeywords = useAtomValue(incomeSearchKeywordsAtom);
	const selectedCategoryIds = useAtomValue(incomeCategoryFilterAtom);
	const selectedWalletIds = useAtomValue(incomeWalletFilterAtom);
	const amountFilter = useAtomValue(incomeAmountFilterAtom);
	const deferredSearchKeywords = useDeferredValue(searchKeywords);

	const dateRange = toFromToDateObject(searchByDate);

	const { onSelectIncome } = useSelectedIncome();

	useEffect(() => {
		if (searchById) {
			onSelectIncome(searchById);
		}
	}, [searchById, onSelectIncome]);

	const filteredIncomes = filter(incomes, {
		selectedCategoryIds,
		selectedWalletIds,
		searchKeywords: deferredSearchKeywords,
		amountFilter,
		dateRange: dateRange || undefined,
	});

	return (
		<>
			<Toolbar>
				<ToolbarGroup>
					<ToolbarTitle>Incomes</ToolbarTitle>
				</ToolbarGroup>
				<ToolbarActions>
					<ScanReceiptDialogTrigger />
					<QuickExpensesDialogTrigger />
					<CreateIncomeDialogTrigger />
					<CreateExpenseDialogTrigger />
					<ToolbarSeparator />
					<RedactedAmountToggle />
				</ToolbarActions>
			</Toolbar>

			<PageContent>
				<Section>
					<IncomeFilterDropdown />
					<SectionContent
						columns={12}
						className="h-[calc(100vh-84px-62px)] grid-cols-1 overflow-hidden max-md:h-[calc(100vh-84px-62px)] md:gap-0"
					>
						<SectionItem
							data-slot="income-list"
							desktopSpan="col-span-6"
							tabletSpan={1}
							mobileOrder={1}
						>
							<IncomeList incomes={filteredIncomes} />
						</SectionItem>

						<SectionItem
							data-slot="income-details"
							desktopSpan="col-span-6"
							tabletSpan={1}
							mobileOrder={2}
							hideOnMobile
						>
							<IncomeDetails incomes={filteredIncomes} />
						</SectionItem>
					</SectionContent>

					{shouldUseMobileLayout && <MobileIncomeDetails incomes={filteredIncomes} />}
				</Section>
			</PageContent>
		</>
	);
}

function filter(
	data: SyncedIncome[],
	condition: {
		selectedCategoryIds: string[];
		selectedWalletIds: string[];
		searchKeywords: string;
		amountFilter: AmountFilterState;
		dateRange?: { from: Date; to: Date };
	},
) {
	const { selectedCategoryIds, selectedWalletIds, searchKeywords, amountFilter, dateRange } =
		condition;

	return data.filter((income) => {
		// Category filter
		if (selectedCategoryIds.length > 0) {
			const categoryId = income.category?.id;
			if (!categoryId || !selectedCategoryIds.includes(categoryId)) {
				return false;
			}
		}
		// Wallet filter
		if (selectedWalletIds.length > 0) {
			const walletId = income.wallet?.id;
			if (!walletId || !selectedWalletIds.includes(walletId)) {
				return false;
			}
		}
		// Amount filter
		if (amountFilter.min !== null || amountFilter.max !== null) {
			const amount = income.realAmount;
			if (amountFilter.min !== null && amount < amountFilter.min) {
				return false;
			}
			if (amountFilter.max !== null && amount > amountFilter.max) {
				return false;
			}
		}
		// Date filter
		if (dateRange) {
			const incomeDate = new Date(income.date);
			const fromDate = new Date(dateRange.from);
			fromDate.setHours(0, 0, 0, 0);
			const toDate = new Date(dateRange.to);
			toDate.setHours(23, 59, 59, 999);

			if (incomeDate < fromDate || incomeDate > toDate) {
				return false;
			}
		}
		// Search by keywords
		if (searchKeywords) {
			return matchesSearch(searchKeywords, {
				textFields: [income.title, income.description],
				numericFields: [income.realAmount],
			});
		}

		return true;
	});
}
