import { createFileRoute } from "@tanstack/react-router";
import { type } from "arktype";
import { useAtom } from "jotai";
import { useHotkeys } from "react-hotkeys-hook";

import { PlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@hoalu/ui/card";
import { selectedExpenseAtom } from "@/atoms";
import {
	CreateExpenseDialogTrigger,
	DeleteExpense,
	EditExpenseForm,
	ExpenseCalendar,
} from "@/components/expense";
import { ExpensesList } from "@/components/expenses-list";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { useExpenses } from "@/hooks/use-expenses";

export const Route = createFileRoute("/_dashboard/$slug/expenses")({
	validateSearch: type({
		"date?": "string",
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const { date: searchDate } = Route.useSearch();
	const expenses = useExpenses({ groupByDate: true });
	const [selectedRow, setSelectedRow] = useAtom(selectedExpenseAtom);

	function handleRowClick(id: string | null) {
		setSelectedRow({ id });
	}

	useHotkeys("esc", () => {
		setSelectedRow({ id: null });
	}, []);

	const expenseList = Array.from(expenses.entries()).filter(([key, _value]) => {
		if (searchDate) {
			return key === searchDate;
		}
		return true;
	});

	console.log(expenseList);

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
				<SectionContent columns={12} className="gap-0">
					<div className="col-span-5 h-[calc(100vh-98px)] overflow-hidden">
						<div className="scrollbar-thin h-full overflow-auto">
							<ExpensesList data={expenseList} onRowClick={handleRowClick} />
						</div>
					</div>
					<div className="col-span-4 h-[calc(100vh-98px)] overflow-hidden">
						<Card className="flex h-full overflow-auto rounded-none border-b-0">
							<CardHeader>
								<CardTitle>Expense details</CardTitle>
								{selectedRow.id && (
									<CardAction>
										<DeleteExpense id={selectedRow.id} />
									</CardAction>
								)}
							</CardHeader>
							<CardContent>
								{selectedRow.id && <EditExpenseForm id={selectedRow.id} />}
								{!selectedRow.id && (
									<h2 className="rounded-md bg-muted/50 p-4 text-center text-muted-foreground">
										No expenses selected
									</h2>
								)}
							</CardContent>
						</Card>
					</div>
					<div className="col-span-3 flex h-[calc(100vh-98px)] flex-col gap-4 overflow-hidden px-4">
						<ExpenseCalendar />
						<hr />
					</div>
				</SectionContent>
			</SectionContent>
		</Section>
	);
}
