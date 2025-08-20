import { createFileRoute } from "@tanstack/react-router";

import { CategoryBreakdownChart } from "@/components/charts/category-breakdown-chart";
import { DashboardDateFilter } from "@/components/charts/dashboard-date-filter";
import { ExpenseStatsRow } from "@/components/charts/expense-stats-row";
import { ExpenseDashboardChart } from "@/components/charts/expenses-dashboard-chart";
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
					<SectionTitle>Shortcuts</SectionTitle>
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
				<SectionContent>
					<ExpenseStatsRow />
					<Section>
						<SectionContent columns={12}>
							<div data-slot="expense-chart" className="col-span-6">
								<ExpenseDashboardChart />
							</div>
							<div data-slot="category-breakdown" className="col-span-3">
								<CategoryBreakdownChart />
							</div>
						</SectionContent>
					</Section>
				</SectionContent>
			</Section>
		</>
	);
}
