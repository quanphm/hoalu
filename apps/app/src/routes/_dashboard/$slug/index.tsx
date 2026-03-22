import { useLiveQueryCategories } from "#app/components/categories/use-categories.ts";
import { CashFlowCard } from "#app/components/charts/cash-flow-card.tsx";
import { CategoryBreakdown } from "#app/components/charts/category-breakdown.tsx";
import { DashboardDateFilter } from "#app/components/charts/dashboard-date-filter.tsx";
// import { ExpenseStatsRow } from "#app/components/charts/expense-stats-row.tsx";
import { ExpenseOverview } from "#app/components/charts/expenses-overview.tsx";
// import { IncomeExpenseComparison } from "#app/components/charts/income-expense-comparison.tsx";
import { CreateExpenseDialogTrigger } from "#app/components/expenses/expense-actions.tsx";
import { RecentExpenses } from "#app/components/expenses/recent-expenses.tsx";
import { useLiveQueryExpenses } from "#app/components/expenses/use-expenses.ts";
import { CreateIncomeDialogTrigger } from "#app/components/incomes/income-actions.tsx";
import { useLiveQueryIncomes } from "#app/components/incomes/use-incomes.ts";
import {
	Section,
	SectionContent,
	SectionHeader,
	SectionTitle,
} from "#app/components/layouts/section.tsx";
import { QueuePanel } from "#app/components/queue-panel.tsx";
import { QuickExpensesDialogTrigger } from "#app/components/quick-expenses/quick-expenses-dialog.tsx";
import { ScanReceiptDialogTrigger } from "#app/components/receipt/scan-receipt-dialog.tsx";
// import { VoiceExpenseDialogTrigger } from "#app/components/voice/voice-expense-dialog.tsx";
import { UpcomingBillsWidget } from "#app/components/upcoming-bills/upcoming-bills-widget.tsx";
import { CreateWalletDialogTrigger } from "#app/components/wallets/wallet-actions.tsx";
import { MAX_QUEUE_SIZE } from "#app/helpers/constants.ts";
import { useQueueStatus } from "#app/hooks/use-queue.ts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/")({
	component: RouteComponent,
});

function RouteComponent() {
	const expenses = useLiveQueryExpenses();
	const incomes = useLiveQueryIncomes();
	const categories = useLiveQueryCategories();
	const { totalActiveJobs } = useQueueStatus();

	return (
		<>
			<Section>
				<SectionContent columns={6}>
					<ScanReceiptDialogTrigger />
					{/* <VoiceExpenseDialogTrigger /> */}
					<QuickExpensesDialogTrigger />
					<CreateExpenseDialogTrigger />
					<CreateIncomeDialogTrigger />
					<CreateWalletDialogTrigger />
				</SectionContent>
			</Section>

			<Section>
				<SectionHeader className="flex-row items-center gap-2">
					<SectionTitle className="flex items-center gap-2">
						Jobs
						<span className="text-muted-foreground text-sm">
							{totalActiveJobs} / {MAX_QUEUE_SIZE}
						</span>
					</SectionTitle>
				</SectionHeader>
				<SectionContent columns={4}>
					<QueuePanel />
				</SectionContent>
			</Section>

			<Section>
				<SectionHeader className="flex-col items-start">
					<SectionTitle>Overview</SectionTitle>
				</SectionHeader>
				<SectionContent columns={12} className="items-start">
					<div className="col-span-12 w-full md:col-span-7">
						<DashboardDateFilter categories={categories} />
					</div>
					<div className="@container/main col-span-12 flex w-full flex-row gap-4">
						<CashFlowCard incomes={incomes} expenses={expenses} />
					</div>
					<div className="col-span-12 flex w-full flex-col gap-4 md:col-span-7">
						<ExpenseOverview expenses={expenses} categories={categories} />
						<RecentExpenses />
					</div>
					{/* <div className="col-span-12 flex w-full flex-col gap-4 md:col-span-6">
						<IncomeExpenseComparison incomes={incomes} expenses={expenses} />
					</div> */}
					<div className="col-span-12 flex w-full flex-col gap-4 md:col-span-5">
						{/* <ExpenseStatsRow expenses={expenses} /> */}
						<CategoryBreakdown expenses={expenses} categories={categories} />
						<UpcomingBillsWidget />
					</div>
				</SectionContent>
			</Section>
		</>
	);
}
