import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { type } from "arktype";

import { datetime } from "@hoalu/common/datetime";
import { PlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { CreateExpenseDialogTrigger } from "@/components/expense";
import { ExpensesTable } from "@/components/expenses-table";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { expensesQueryOptions } from "@/services/query-options";

export const Route = createFileRoute("/_dashboard/$slug/expenses")({
	validateSearch: type({
		"date?": "string",
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = Route.useParams();
	const { date: searchDate } = Route.useSearch();
	const { data: expenses } = useSuspenseQuery(expensesQueryOptions(slug));

	const filteredExpenses = expenses.filter((expense) => {
		if (!searchDate) return true;
		const expenseDate = datetime.format(new Date(expense.date), "yyyy-MM-dd");
		return expenseDate === searchDate;
	});

	return (
		<Section>
			<SectionHeader>
				<SectionTitle>Expenses</SectionTitle>
				<CreateExpenseDialogTrigger>
					<Button variant="outline" size="sm">
						<PlusIcon className="mr-2 size-4" />
						Create expense
					</Button>
				</CreateExpenseDialogTrigger>
			</SectionHeader>
			<SectionContent>
				<ExpensesTable data={filteredExpenses} />
				{/* <div className="col-span-3">
					<ContentCard content={<ExpenseCalendar />} />
				</div> */}
			</SectionContent>
		</Section>
	);
}
