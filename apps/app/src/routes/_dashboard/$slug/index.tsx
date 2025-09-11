import { createFileRoute } from "@tanstack/react-router";

import { CategoryBreakdown } from "@/components/charts/category-breakdown";
import { DashboardDateFilter } from "@/components/charts/dashboard-date-filter";
import { ExpenseStatsRow } from "@/components/charts/expense-stats-row";
import { ExpenseOverview } from "@/components/charts/expenses-overview";
import { CreateExpenseDialogTrigger } from "@/components/expenses/expense-actions";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/layouts/section";
import { CreateWalletDialogTrigger } from "@/components/wallets/wallet-actions";

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

			<hr />

			<Section>
				<SectionHeader>
					<SectionTitle>Analytics</SectionTitle>
					<DashboardDateFilter />
				</SectionHeader>
				<SectionContent columns={12}>
					<div className="col-span-12 md:col-span-6">
						<ExpenseOverview />
					</div>
					<div className="col-span-12 flex flex-col gap-4 md:col-span-6">
						<ExpenseStatsRow />
						<CategoryBreakdown />
					</div>
				</SectionContent>
			</Section>
		</>
	);
}
