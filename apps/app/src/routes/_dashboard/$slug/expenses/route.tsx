import { ExpenseFilterDropdown } from "#app/components/expenses/expense-filter-dropdown.tsx";
import ExpenseList from "#app/components/expenses/expense-list.tsx";
import { useFilteredExpenses } from "#app/components/expenses/use-expenses.ts";
import { PageContent } from "#app/components/layouts/page-content.tsx";
import { Section, SectionContent, SectionItem } from "#app/components/layouts/section.tsx";
import {
	Toolbar,
	ToolbarActions,
	ToolbarGroup,
	ToolbarSeparator,
	ToolbarTitle,
} from "#app/components/layouts/toolbar.tsx";
import { useLayoutMode } from "#app/components/layouts/use-layout-mode.ts";
import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import { CreateExpenseDialogTrigger } from "#app/components/expenses/expense-actions.tsx";
import { CreateIncomeDialogTrigger } from "#app/components/incomes/income-actions.tsx";
import { QuickExpensesDialogTrigger } from "#app/components/quick-expenses/quick-expenses-dialog.tsx";
import { ScanReceiptDialogTrigger } from "#app/components/receipt/scan-receipt-dialog.tsx";
import { RedactedAmountToggle } from "#app/components/redacted-amount-toggle.tsx";
import * as z from "zod";

const searchSchema = z.object({
	date: z.optional(z.string()),
});

export const Route = createFileRoute("/_dashboard/$slug/expenses")({
	validateSearch: searchSchema,
	component: LayoutComponent,
});

function LayoutComponent() {
	const matches = useMatches();
	const expenseMatch = matches.find(
		(m) => m.routeId === "/_dashboard/$slug/expenses/$expenseId",
	);
	const expenseId = expenseMatch
		? (expenseMatch.params as Record<string, string>).expenseId
		: undefined;

	const { shouldUseMobileLayout } = useLayoutMode();
	const filteredExpenses = useFilteredExpenses();

	return (
		<>
			<Toolbar>
				<ToolbarGroup>
					<ToolbarTitle>Expenses</ToolbarTitle>
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
				<Section>
					<ExpenseFilterDropdown />
					<SectionContent
						columns={12}
						className="h-[calc(100vh-84px-62px)] grid-cols-1 overflow-hidden max-md:h-[calc(100vh-84px-62px)] md:gap-0"
					>
						<SectionItem
							data-slot="expense-list"
							desktopSpan="col-span-5"
							tabletSpan={1}
							mobileOrder={1}
						>
							<ExpenseList expenses={filteredExpenses} selectedId={expenseId ?? null} />
						</SectionItem>
						{!shouldUseMobileLayout && (
							<SectionItem
								data-slot="expense-details"
								desktopSpan="col-span-7"
								tabletSpan={1}
								mobileOrder={2}
								hideOnMobile
							>
								<Outlet />
							</SectionItem>
						)}
					</SectionContent>

					{shouldUseMobileLayout && <Outlet />}
				</Section>
			</PageContent>
		</>
	);
}
