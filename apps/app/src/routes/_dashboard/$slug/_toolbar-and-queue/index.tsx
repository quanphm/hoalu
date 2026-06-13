import { createFileRoute } from "@tanstack/react-router";

import { useLiveQueryCategories } from "#app/components/categories/use-categories.ts";
import { CashFlowChart } from "#app/components/charts/cash-flow-chart.tsx";
import { CashFlowSection } from "#app/components/charts/cash-flow.tsx";
import { CategoryBreakdown } from "#app/components/charts/category-breakdown.tsx";
import { ExpenseOverview } from "#app/components/charts/expenses-overview.tsx";
import { RecentTransactions } from "#app/components/expenses/recent-transactions.tsx";
import { useLiveQueryExpenses } from "#app/components/expenses/use-expenses.ts";
import { useLiveQueryIncomes } from "#app/components/incomes/use-incomes.ts";
import { DashboardLayout } from "#app/components/layouts/dashboard-layout.tsx";
import { SectionContent } from "#app/components/layouts/section.tsx";
import { UpcomingBillsWidget } from "#app/components/upcoming-bills/upcoming-bills-widget.tsx";

export const Route = createFileRoute("/_dashboard/$slug/_toolbar-and-queue/")({
	component: RouteComponent,
});

function RouteComponent() {
	const expenses = useLiveQueryExpenses();
	const incomes = useLiveQueryIncomes();
	const categories = useLiveQueryCategories();

	return (
		<DashboardLayout
			main={
				<SectionContent className="items-start gap-4">
					<CashFlowSection incomes={incomes} expenses={expenses} />
					<ExpenseOverview incomes={incomes} expenses={expenses} categories={categories} />
					<RecentTransactions />
				</SectionContent>
			}
			sidebar={
				<>
					<CashFlowChart incomes={incomes} expenses={expenses} />
					<CategoryBreakdown expenses={expenses} categories={categories} />
					<UpcomingBillsWidget />
				</>
			}
		/>
	);
}
