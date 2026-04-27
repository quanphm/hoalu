import { DashboardDateFilter } from "#app/components/charts/dashboard-date-filter.tsx";
import { CreateExpenseDialogTrigger } from "#app/components/expenses/expense-actions.tsx";
import { CreateIncomeDialogTrigger } from "#app/components/incomes/income-actions.tsx";
import { PageContent } from "#app/components/layouts/page-content.tsx";
import {
	Toolbar,
	ToolbarActions,
	ToolbarGroup,
	ToolbarSeparator,
	ToolbarTitle,
} from "#app/components/layouts/toolbar.tsx";
import { QueuePanel } from "#app/components/queue-panel.tsx";
import { QuickExpensesDialogTrigger } from "#app/components/quick-expenses/quick-expenses-dialog.tsx";
import { ScanReceiptDialogTrigger } from "#app/components/receipt/scan-receipt-dialog.tsx";
import { RedactedAmountToggle } from "#app/components/redacted-amount-toggle.tsx";
import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/_toolbar-and-queue")({
	component: RouteComponent,
});

function RouteComponent() {
	const matches = useMatches();
	const dashboardMatch = matches.find((m) => m.routeId === "/_dashboard/$slug/_toolbar-and-queue/");
	const transactionMatch = matches.find(
		(m) => m.routeId === "/_dashboard/$slug/_toolbar-and-queue/transactions",
	);

	return (
		<>
			<Toolbar>
				<ToolbarGroup>
					{dashboardMatch && (
						<>
							<ToolbarTitle>Dashboard</ToolbarTitle>
							<DashboardDateFilter />
						</>
					)}
					{transactionMatch && (
						<>
							<ToolbarTitle>Transactions</ToolbarTitle>
						</>
					)}
				</ToolbarGroup>
				<ToolbarActions>
					<ScanReceiptDialogTrigger />
					<QuickExpensesDialogTrigger />
					<CreateIncomeDialogTrigger />
					<CreateExpenseDialogTrigger />
					<ToolbarSeparator />
					<RedactedAmountToggle />
				</ToolbarActions>
			</Toolbar>

			<PageContent>
				<QueuePanel />
				<Outlet />
			</PageContent>
		</>
	);
}
