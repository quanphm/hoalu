import { type TransactionKindFilter, transactionKindFilterAtom } from "#app/atoms/index.ts";
import { ExpenseSearch } from "#app/components/expenses/expense-actions.tsx";
import { ExpenseFilterDropdown } from "#app/components/expenses/expense-filter-dropdown.tsx";
import ExpenseList from "#app/components/expenses/expense-list.tsx";
import { Section, SectionContent, SectionItem } from "#app/components/layouts/section.tsx";
import { useFilteredTransactions } from "#app/components/transactions/use-transactions.ts";
import { Tabs, TabsList, TabsTab } from "@hoalu/ui/tabs";
import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import { useAtom } from "jotai";
import * as z from "zod";

const searchSchema = z.object({
	date: z.optional(z.string()),
});

export const Route = createFileRoute("/_dashboard/$slug/_toolbar-and-queue/transactions")({
	validateSearch: searchSchema,
	component: LayoutComponent,
});

function LayoutComponent() {
	const matches = useMatches();

	const transactionMatch = matches.find(
		(m) => m.routeId === "/_dashboard/$slug/_toolbar-and-queue/transactions/$transactionId",
	);
	const transactionId = transactionMatch ? transactionMatch.params.transactionId : undefined;

	const filteredExpenses = useFilteredTransactions();
	const [kindFilter, setKindFilter] = useAtom(transactionKindFilterAtom);

	return (
		<Section>
			{transactionId ? (
				<Outlet />
			) : (
				<>
					<div className="flex items-center justify-between border-b px-4 py-2">
						<div className="flex flex-wrap items-center gap-2">
							<ExpenseSearch />
							<ExpenseFilterDropdown />
						</div>
						<Tabs
							value={kindFilter}
							onValueChange={(v) => setKindFilter(v as TransactionKindFilter)}
						>
							<TabsList>
								<TabsTab value="all" className="sm:h-6">
									All
								</TabsTab>
								<TabsTab value="income" className="sm:h-6">
									Incomes
								</TabsTab>
								<TabsTab value="expense" className="sm:h-6">
									Expenses
								</TabsTab>
							</TabsList>
						</Tabs>
					</div>
					<SectionContent
						columns={12}
						className="h-[calc(100vh-(--spacing(33)))] grid-cols-1 overflow-hidden md:gap-0"
					>
						<SectionItem desktopSpan="col-span-12" tabletSpan={1} mobileOrder={1}>
							<ExpenseList expenses={filteredExpenses} />
						</SectionItem>
					</SectionContent>
				</>
			)}
		</Section>
	);
}
