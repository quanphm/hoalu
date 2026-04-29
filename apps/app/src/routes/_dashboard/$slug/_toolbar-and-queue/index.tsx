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
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/_toolbar-and-queue/")({
	component: RouteComponent,
});

function RouteComponent() {
	const expenses = useLiveQueryExpenses();
	const incomes = useLiveQueryIncomes();
	const categories = useLiveQueryCategories();

	return (
		<>
			<SectionContent columns={25} className="items-start gap-0 md:gap-0">
				<div className="col-span-25 flex w-full flex-row gap-4">
					<CashFlowSection incomes={incomes} expenses={expenses} />
				</div>
				<div className="col-span-25 flex w-full flex-col gap-4 md:col-span-17">
					<ExpenseOverview incomes={incomes} expenses={expenses} categories={categories} />
				</div>
				<div className="col-span-25 flex h-full w-full flex-col gap-4 md:col-span-8">
					<CashFlowChart incomes={incomes} expenses={expenses} />
				</div>
				<div className="col-span-25 hidden w-full flex-col gap-4 md:col-span-17 md:flex">
					<RecentTransactions />
				</div>
				<div className="col-span-25 flex w-full flex-col md:col-span-8">
					<CategoryBreakdown expenses={expenses} categories={categories} />
					<UpcomingBillsWidget />
				</div>
			</SectionContent>
		</>
	);
}
