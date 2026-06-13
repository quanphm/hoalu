import { createFileRoute } from "@tanstack/react-router";

import { useLiveQueryCategories } from "#app/components/categories/use-categories.ts";
import { CashFlowChart } from "#app/components/charts/cash-flow-chart.tsx";
import { CashFlowSection } from "#app/components/charts/cash-flow.tsx";
import { CategoryBreakdown } from "#app/components/charts/category-breakdown.tsx";
import { ExpenseOverview } from "#app/components/charts/expenses-overview.tsx";
import { RecentTransactions } from "#app/components/expenses/recent-transactions.tsx";
import { useLiveQueryExpenses } from "#app/components/expenses/use-expenses.ts";
import { useLiveQueryIncomes } from "#app/components/incomes/use-incomes.ts";
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
		<SectionContent columns={24} className="items-start gap-4 p-4">
			<div className="col-span-24 flex h-full flex-col gap-4 md:col-span-8">
				<CashFlowChart incomes={incomes} expenses={expenses} />
			</div>
			<div className="col-span-24 flex flex-col gap-0 md:col-span-16">
				<ExpenseOverview incomes={incomes} expenses={expenses} categories={categories} />
				<CashFlowSection incomes={incomes} expenses={expenses} />
			</div>

			<div className="col-span-24 flex flex-col gap-4 md:col-span-16">
				<SectionContent columns={2}>
					<div className="col-span-1 flex h-full flex-col gap-4">
						<UpcomingBillsWidget />
					</div>
					<div className="col-span-1 flex h-full flex-col gap-4">
						<CategoryBreakdown expenses={expenses} categories={categories} />
					</div>
				</SectionContent>
			</div>
			<div className="col-span-24 flex flex-col gap-4 md:col-span-8"></div>

			<div className="col-span-24 flex flex-col gap-4 md:col-span-24">
				<RecentTransactions />
			</div>
		</SectionContent>
	);
}
