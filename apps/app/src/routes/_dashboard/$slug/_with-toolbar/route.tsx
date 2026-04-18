import { DashboardDateFilter } from "#app/components/charts/dashboard-date-filter.tsx";
import { CreateExpenseDialogTrigger } from "#app/components/expenses/expense-actions.tsx";
import { CreateIncomeDialogTrigger } from "#app/components/incomes/income-actions.tsx";
import { PageContent } from "#app/components/layouts/page-content.tsx";
import { QuickExpensesDialogTrigger } from "#app/components/quick-expenses/quick-expenses-dialog.tsx";
import { ScanReceiptDialogTrigger } from "#app/components/receipt/scan-receipt-dialog.tsx";
import { RedactedAmountToggle } from "#app/components/redacted-amount-toggle.tsx";
import { Separator } from "@hoalu/ui/separator";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/_with-toolbar")({
	component: RouteComponent,
});

function Toolbar() {
	return (
		<div className="bg-card relative flex w-full items-center justify-between border-b px-4 py-2.5 lg:flex-row">
			<div className="flex items-center gap-3">
				<p className="text-sm leading-none font-semibold">Dashboard</p>
				<DashboardDateFilter />
			</div>
			<div className="flex items-center justify-end gap-3">
				<ScanReceiptDialogTrigger />
				{/* <VoiceExpenseDialogTrigger /> */}
				<QuickExpensesDialogTrigger />
				<CreateExpenseDialogTrigger />
				<CreateIncomeDialogTrigger />
				{/* <CreateWalletDialogTrigger /> */}
				<Separator orientation="vertical" className="data-[orientation=vertical]:h-6" />
				<RedactedAmountToggle />
			</div>
		</div>
	);
}

function RouteComponent() {
	return (
		<>
			<Toolbar />
			<PageContent className="p-0!">
				<Outlet />
			</PageContent>
		</>
	);
}
