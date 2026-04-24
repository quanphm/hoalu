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
import { QuickExpensesDialogTrigger } from "#app/components/quick-expenses/quick-expenses-dialog.tsx";
import { ScanReceiptDialogTrigger } from "#app/components/receipt/scan-receipt-dialog.tsx";
import { RedactedAmountToggle } from "#app/components/redacted-amount-toggle.tsx";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/_with-toolbar")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<Toolbar>
				<ToolbarGroup>
					<ToolbarTitle>Dashboard</ToolbarTitle>
					<DashboardDateFilter />
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
				<Outlet />
			</PageContent>
		</>
	);
}
