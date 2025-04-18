import { CreateExpenseDialogTrigger } from "@/components/expense";
import { ExpensesTable } from "@/components/expenses-table";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { useExpenses } from "@/hooks/use-expenses";
import { PlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { Calendar } from "@hoalu/ui/calendar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/expenses")({
	component: RouteComponent,
});

function RouteComponent() {
	const expenses = useExpenses();

	return (
		<Section>
			<SectionHeader>
				<SectionTitle>Expense entries</SectionTitle>
				<CreateExpenseDialogTrigger>
					<Button variant="outline" size="sm">
						<PlusIcon className="mr-2 size-4" />
						Create expense
					</Button>
				</CreateExpenseDialogTrigger>
			</SectionHeader>
			<SectionContent columns={12}>
				<div className="col-span-9">
					<ExpensesTable data={expenses} />
				</div>
				<div className="col-span-3">
					<div className="rounded-md border">
						<Calendar mode="single" className="w-full p-2" />
					</div>
				</div>
			</SectionContent>
		</Section>
	);
}
