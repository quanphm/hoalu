import {
	incomeAmountFilterAtom,
	incomeCategoryFilterAtom,
	incomeWalletFilterAtom,
	incomeSearchKeywordsAtom,
} from "#app/atoms/income-filters.ts";
import { CreateIncomeDialogTrigger } from "#app/components/incomes/income-actions.tsx";
import { IncomeDetails, MobileIncomeDetails } from "#app/components/incomes/income-details.tsx";
import { IncomeFilterDropdown } from "#app/components/incomes/income-filter-dropdown.tsx";
import IncomeList from "#app/components/incomes/income-list.tsx";
import {
	type SyncedIncome,
	useLiveQueryIncomes,
	useSelectedIncome,
} from "#app/components/incomes/use-incomes.ts";
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
import { createFileRoute } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useDeferredValue, useEffect } from "react";
import * as z from "zod";

interface AmountFilterState {
	min: number | null;
	max: number | null;
}

const searchSchema = z.object({
	id: z.optional(z.string()),
});

export const Route = createFileRoute("/_dashboard/$slug/_normal/incomes")({
	validateSearch: searchSchema,
	component: RouteComponent,
});

function RouteComponent() {
	const { id: searchById } = Route.useSearch();

	const { shouldUseMobileLayout } = useLayoutMode();
	const incomes = useLiveQueryIncomes();

	const searchKeywords = useAtomValue(incomeSearchKeywordsAtom);
	const selectedCategoryIds = useAtomValue(incomeCategoryFilterAtom);
	const selectedWalletIds = useAtomValue(incomeWalletFilterAtom);
	const amountFilter = useAtomValue(incomeAmountFilterAtom);
	const deferredSearchKeywords = useDeferredValue(searchKeywords);

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
	});

	return (
		<Section className="-mb-8">
			<SectionHeader>
				<SectionTitle>Income</SectionTitle>
				<SectionAction className="flex items-center gap-2">
					<CreateIncomeDialogTrigger />
				</SectionAction>
			</SectionHeader>

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
	);
}

function filter(
	data: SyncedIncome[],
	condition: {
		selectedCategoryIds: string[];
		selectedWalletIds: string[];
		searchKeywords: string;
		amountFilter: AmountFilterState;
	},
) {
	const { selectedCategoryIds, selectedWalletIds, searchKeywords, amountFilter } = condition;

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
