import { createFileRoute } from "@tanstack/react-router";
import { type } from "arktype";

import { CreateExpenseDialogTrigger } from "@/components/expenses/expense-actions";
import { ExpenseDetails } from "@/components/expenses/expense-details";
import { ExpenseFilter } from "@/components/expenses/expense-filter";
import ExpenseList from "@/components/expenses/expense-list";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/layouts/section";
import { useExpenseStats } from "@/hooks/use-expenses";

export const Route = createFileRoute("/_dashboard/$slug/expenses")({
	validateSearch: type({
		"date?": "string",
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const data = useExpenseStats();
	console.log(data);

	return (
		<Section className="-mb-8">
			<SectionHeader>
				<SectionTitle>Expenses</SectionTitle>
				<CreateExpenseDialogTrigger />
			</SectionHeader>

			<SectionContent columns={12} className="h-[calc(100vh-92px)] gap-0 overflow-hidden">
				<div data-slot="expense-filter" className="col-span-3 pr-6">
					<div className="flex flex-col gap-4">
						<ExpenseFilter />
					</div>
				</div>

				<div data-slot="expense-list" className="col-span-4">
					<ExpenseList />
				</div>

				<div data-slot="expense-details" className="col-span-5">
					<ExpenseDetails />
				</div>
			</SectionContent>
		</Section>
	);
}
