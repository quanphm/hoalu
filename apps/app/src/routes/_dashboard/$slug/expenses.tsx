import { createFileRoute } from "@tanstack/react-router";
import { type } from "arktype";

import { PlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import {
	CreateExpenseDialogTrigger,
	ExpenseCalendar,
	ExpenseSearch,
} from "@/components/expenses/expense-actions";
import { ExpenseDetails } from "@/components/expenses/expense-details";
import { ExpenseCategoryFilter } from "@/components/expenses/expenses-category-filter";
import ExpensesList from "@/components/expenses/expenses-list";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/layouts/section";

export const Route = createFileRoute("/_dashboard/$slug/expenses")({
	validateSearch: type({
		"date?": "string",
	}),
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Section className="-mb-8">
			<SectionHeader>
				<SectionTitle>Expenses</SectionTitle>
				<CreateExpenseDialogTrigger>
					<Button variant="outline" size="sm">
						<PlusIcon className="mr-2 size-4" />
						Create expense
					</Button>
				</CreateExpenseDialogTrigger>
			</SectionHeader>

			<SectionContent columns={12} className="gap-0">
				<div data-slot="expense-list" className="col-span-4 h-[calc(100vh-89px)] overflow-hidden">
					<ExpenseSearch />
					<div className="scrollbar-thin h-[calc(100vh-136px)] overflow-auto">
						<ExpensesList />
					</div>
				</div>

				<div
					data-slot="expense-details"
					className="col-span-5 h-[calc(100vh-89px)] overflow-hidden"
				>
					<ExpenseDetails />
				</div>

				<div
					data-slot="expense-filter"
					className="col-span-3 flex h-[calc(100vh-89px)] overflow-hidden px-4"
				>
					<div className="flex h-full flex-col gap-4 overflow-auto">
						<ExpenseCalendar />
						<hr />
						<ExpenseCategoryFilter />
					</div>
				</div>
			</SectionContent>
		</Section>
	);
}
