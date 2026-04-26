import {
	CreateExpenseDialogTrigger,
	ExpenseSearch,
} from "#app/components/expenses/expense-actions.tsx";
import { ExpenseFilterDropdown } from "#app/components/expenses/expense-filter-dropdown.tsx";
import ExpenseList from "#app/components/expenses/expense-list.tsx";
import { useFilteredExpenses } from "#app/components/expenses/use-expenses.ts";
import { CreateIncomeDialogTrigger } from "#app/components/incomes/income-actions.tsx";
import { PageContent } from "#app/components/layouts/page-content.tsx";
import { Section, SectionContent, SectionItem } from "#app/components/layouts/section.tsx";
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
import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import * as z from "zod";

const searchSchema = z.object({
	date: z.optional(z.string()),
});

export const Route = createFileRoute("/_dashboard/$slug/transactions")({
	validateSearch: searchSchema,
	component: LayoutComponent,
});

function LayoutComponent() {
	const matches = useMatches();
	const transactionMatch = matches.find(
		(m) => m.routeId === "/_dashboard/$slug/transactions/$transactionId",
	);
	const transactionId = transactionMatch
		? (transactionMatch.params as Record<string, string>).transactionId
		: undefined;

	const filteredExpenses = useFilteredExpenses();

	return (
		<>
			<Toolbar>
				<ToolbarGroup>
					<ToolbarTitle>Transactions</ToolbarTitle>
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
				<Section className="gap-0">
					{transactionId ? (
						<Outlet />
					) : (
						<>
							<div className="flex flex-wrap items-center gap-2 px-4 py-2">
								<ExpenseSearch />
								<ExpenseFilterDropdown />
							</div>
							<SectionContent
								columns={12}
								className="h-[calc(100vh-100px)] grid-cols-1 overflow-hidden md:gap-0"
							>
								<SectionItem desktopSpan="col-span-12" tabletSpan={1} mobileOrder={1}>
									<ExpenseList expenses={filteredExpenses} selectedId={null} />
								</SectionItem>
							</SectionContent>
						</>
					)}
				</Section>
			</PageContent>
		</>
	);
}
