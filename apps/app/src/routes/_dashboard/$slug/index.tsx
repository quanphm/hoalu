import { useLiveQueryCategories } from "#app/components/categories/use-categories.ts";
import { CategoryBreakdown } from "#app/components/charts/category-breakdown.tsx";
import { DashboardDateFilter } from "#app/components/charts/dashboard-date-filter.tsx";
import { ExpenseStatsRow } from "#app/components/charts/expense-stats-row.tsx";
import { ExpenseOverview } from "#app/components/charts/expenses-overview.tsx";
import { CreateExpenseDialogTrigger } from "#app/components/expenses/expense-actions.tsx";
import { RecentExpenses } from "#app/components/expenses/recent-expenses.tsx";
import { useLiveQueryExpenses } from "#app/components/expenses/use-expenses.ts";
import {
	Section,
	SectionContent,
	SectionHeader,
	SectionTitle,
} from "#app/components/layouts/section.tsx";
import { CreateWalletDialogTrigger } from "#app/components/wallets/wallet-actions.tsx";
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/_dashboard/$slug/")({
	component: RouteComponent,
});

function RouteComponent() {
	const expenses = useLiveQueryExpenses();
	const categories = useLiveQueryCategories();

	return (
		<>
			<Section>
				<SectionHeader>
					<SectionTitle>Quick actions</SectionTitle>
				</SectionHeader>
				<SectionContent columns={6} className="gap-4">
					<CreateExpenseDialogTrigger />
					<CreateWalletDialogTrigger />
				</SectionContent>
			</Section>

			<Section>
				<SectionHeader className="flex-col items-start">
					<SectionTitle>Analytics</SectionTitle>
				</SectionHeader>
				<SectionContent columns={12} className="items-stretch">
					<div className="col-span-12">
						<DashboardDateFilter categories={categories} />
					</div>
					<div className="col-span-12 flex flex-col md:col-span-7">
						<ExpenseOverview expenses={expenses} categories={categories} />
					</div>
					<div className="col-span-12 flex flex-col gap-6 md:col-span-5">
						<ExpenseStatsRow expenses={expenses} />
						<CategoryBreakdown expenses={expenses} categories={categories} />
					</div>
					<div className="col-span-12 md:col-span-7"></div>
					<div className="col-span-12 flex flex-col gap-6 md:col-span-5">
						<RecentExpenses />
					</div>
				</SectionContent>
			</Section>
		</>
	);
}
