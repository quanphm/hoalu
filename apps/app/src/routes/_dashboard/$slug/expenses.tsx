import { CreateExpenseDialog, CreateExpenseDialogTrigger } from "@/components/expense";
import { ExpensesTable } from "@/components/expenses-table";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { expensesQueryOptions } from "@/services/query-options";
import { PlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/expenses")({
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = Route.useParams();
	const { data: expenses } = useSuspenseQuery(expensesQueryOptions(slug));

	return (
		<Section>
			<SectionHeader>
				<SectionTitle>Expense entries</SectionTitle>
				<CreateExpenseDialog>
					<CreateExpenseDialogTrigger>
						<Button variant="outline" size="sm">
							<PlusIcon className="mr-2 size-4" />
							Create expense
						</Button>
					</CreateExpenseDialogTrigger>
				</CreateExpenseDialog>
			</SectionHeader>
			<SectionContent>
				<ExpensesTable data={expenses} />
			</SectionContent>
		</Section>
	);
}
