import { useLiveQueryCategories } from "#app/components/categories/use-categories.ts";
import { CashFlowSection } from "#app/components/charts/cash-flow.tsx";
import { CategoryBreakdown } from "#app/components/charts/category-breakdown.tsx";
import { ExpenseOverview } from "#app/components/charts/expenses-overview.tsx";
import { RecentTransactions } from "#app/components/expenses/recent-transactions.tsx";
import { useLiveQueryExpenses } from "#app/components/expenses/use-expenses.ts";
import { useLiveQueryIncomes } from "#app/components/incomes/use-incomes.ts";
import { Section, SectionContent } from "#app/components/layouts/section.tsx";
import { QueuePanel } from "#app/components/queue-panel.tsx";
import { UpcomingBillsWidget } from "#app/components/upcoming-bills/upcoming-bills-widget.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/_with-toolbar/")({
	component: RouteComponent,
});

function RouteComponent() {
	const expenses = useLiveQueryExpenses();
	const incomes = useLiveQueryIncomes();
	const categories = useLiveQueryCategories();

	return (
		<>
			<Section>
				<SectionContent columns={4}>
					<QueuePanel />
				</SectionContent>
			</Section>

			<Section>
				<SectionContent columns={24} className="items-start gap-0 md:gap-0">
					<div className="col-span-24 flex w-full flex-row gap-4">
						<CashFlowSection incomes={incomes} expenses={expenses} />
					</div>
					<div className="col-span-24 flex w-full flex-col gap-4 md:col-span-17">
						<ExpenseOverview expenses={expenses} categories={categories} incomes={incomes} />
						<RecentTransactions />
					</div>
					<div className="col-span-24 flex w-full flex-col md:col-span-7">
						<CategoryBreakdown expenses={expenses} categories={categories} />
						<UpcomingBillsWidget />
					</div>
					{/* <div className="col-span-12 w-full flex-col gap-4 md:col-span-8 md:flex">
						<ExpenseStatsRow expenses={expenses} />
					</div> */}
					{/* <div className="col-span-12 flex w-full flex-col gap-4 md:col-span-4">
						<IncomeExpenseComparison incomes={incomes} expenses={expenses} />
					</div> */}
				</SectionContent>
			</Section>
		</>
	);
}
