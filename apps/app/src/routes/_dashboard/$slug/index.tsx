import { createFileRoute } from "@tanstack/react-router";

import { CategoryBreakdown } from "#app/components/charts/category-breakdown.tsx";
import { DashboardDateFilter } from "#app/components/charts/dashboard-date-filter.tsx";
import { ExpenseStatsRow } from "#app/components/charts/expense-stats-row.tsx";
import { ExpenseOverview } from "#app/components/charts/expenses-overview.tsx";
import { CreateExpenseDialogTrigger } from "#app/components/expenses/expense-actions.tsx";
import {
	Section,
	SectionContent,
	SectionHeader,
	SectionTitle,
} from "#app/components/layouts/section.tsx";
import { CreateWalletDialogTrigger } from "#app/components/wallets/wallet-actions.tsx";

export const Route = createFileRoute("/_dashboard/$slug/")({
	component: RouteComponent,
});

function RouteComponent() {
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
				<SectionHeader>
					<SectionTitle>Analytics</SectionTitle>
					<DashboardDateFilter />
				</SectionHeader>
				<SectionContent columns={12}>
					<div className="col-span-12 md:col-span-7">
						<ExpenseOverview />
					</div>
					<div className="col-span-12 flex flex-col gap-4 md:col-span-5">
						<ExpenseStatsRow />
						<CategoryBreakdown />
					</div>
				</SectionContent>
			</Section>
		</>
	);
}
