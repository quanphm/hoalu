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
					<div className="col-span-12 flex w-full flex-col gap-4 md:col-span-7">
						<ExpenseOverview expenses={expenses} categories={categories} />
					</div>
					<div className="col-span-12 flex w-full flex-col gap-4 md:col-span-5">
						<ExpenseStatsRow expenses={expenses} />
						<CategoryBreakdown expenses={expenses} categories={categories} />
					</div>
					<div className="col-span-12 flex w-full flex-col md:col-span-7">
						<UpcomingBillsWidget />
					</div>
					<div className="col-span-12 flex h-full w-full flex-col md:col-span-5">
						<RecentExpenses />
					</div>
				</SectionContent>
			</Section>
		</>
	);
}
