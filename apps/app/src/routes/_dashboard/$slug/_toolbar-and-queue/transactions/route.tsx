import { Tabs, TabsList, TabsTab } from "@hoalu/ui/tabs";
import { useValue } from "@legendapp/state/react";
import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import { useRef } from "react";
import * as z from "zod";

import { type TransactionKindFilter, transactionKindFilter$ } from "#app/atoms/index.ts";
import { ExpenseSearch } from "#app/components/expenses/expense-actions.tsx";
import ExpenseList from "#app/components/expenses/expense-list.tsx";
import { TransactionFilters } from "#app/components/expenses/transaction-filters.tsx";
import { Section, SectionContent, SectionItem } from "#app/components/layouts/section.tsx";
import { useFilteredTransactions } from "#app/components/transactions/use-transactions.ts";

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
	const newTransactionMatch = matches.find(
		(m) => m.routeId === "/_dashboard/$slug/_toolbar-and-queue/transactions/new",
	);
	const showOutlet = !!transactionMatch || !!newTransactionMatch;

	const filteredExpenses = useFilteredTransactions();
	const kindFilter = useValue(transactionKindFilter$);
	const setKindFilter = transactionKindFilter$.set;
	const listScrollRef = useRef(0);

	return (
		<Section>
			{showOutlet ? (
				<Outlet />
			) : (
				<>
					<div className="flex w-full min-w-0 flex-col items-center justify-between gap-2 border-b px-4 py-2 md:flex-row md:gap-0">
						<div className="flex w-full min-w-0 flex-wrap items-center gap-2 md:w-auto">
							<Tabs
								value={kindFilter}
								onValueChange={(v) => setKindFilter(v as TransactionKindFilter)}
							>
								<TabsList>
									<TabsTab value="all" className="h-6!">
										All
									</TabsTab>
									<TabsTab value="income" className="h-6!">
										Incomes
									</TabsTab>
									<TabsTab value="expense" className="h-6!">
										Expenses
									</TabsTab>
								</TabsList>
							</Tabs>
							<ExpenseSearch />
							<TransactionFilters />
						</div>
					</div>

					<SectionContent
						columns={12}
						className="h-[calc(100dvh-(--spacing(33)-1px))] grid-cols-1 overflow-hidden md:gap-0"
					>
						<SectionItem desktopSpan="col-span-12" tabletSpan={1} mobileOrder={1}>
							<ExpenseList expenses={filteredExpenses} scrollRef={listScrollRef} />
						</SectionItem>
					</SectionContent>
				</>
			)}
		</Section>
	);
}
