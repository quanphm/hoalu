import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";

import { DashboardDateFilter } from "#app/components/charts/dashboard-date-filter.tsx";
import { CreateExpenseTrigger } from "#app/components/expenses/expense-actions.tsx";
import { CreateIncomeTrigger } from "#app/components/incomes/income-actions.tsx";
import { PageContent } from "#app/components/layouts/page-content.tsx";
import {
	Toolbar,
	ToolbarActions,
	ToolbarGroup,
	ToolbarSeparator,
	ToolbarTitle,
} from "#app/components/layouts/toolbar.tsx";
import { QueuePanel } from "#app/components/queue-panel.tsx";
import { ScanReceiptDialogTrigger } from "#app/components/receipt/scan-receipt-dialog.tsx";
import { RedactedAmountToggle } from "#app/components/redacted-amount-toggle.tsx";

export const Route = createFileRoute("/_dashboard/$slug/_toolbar-and-queue")({
	component: RouteComponent,
});

function RouteComponent() {
	const matches = useMatches();
	const dashboardMatch = matches.find((m) => m.routeId === "/_dashboard/$slug/_toolbar-and-queue/");
	const transactionMatch = matches.find(
		(m) => m.routeId === "/_dashboard/$slug/_toolbar-and-queue/transactions",
	);
	const transactionDetailMatch = matches.some(
		(m) =>
			m.routeId === "/_dashboard/$slug/_toolbar-and-queue/transactions/new" ||
			m.routeId === "/_dashboard/$slug/_toolbar-and-queue/transactions/$transactionId",
	);

	return (
		<PageContent fill={!!transactionMatch && !transactionDetailMatch}>
			<QueuePanel />

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
					<CreateExpenseTrigger />
					<ScanReceiptDialogTrigger />
					<ToolbarSeparator />
					<CreateIncomeTrigger />
					<ToolbarSeparator />
					<RedactedAmountToggle />
				</ToolbarActions>
			</Toolbar>

			<Outlet />
		</PageContent>
	);
}
