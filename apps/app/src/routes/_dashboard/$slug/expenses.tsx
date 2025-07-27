import { createFileRoute } from "@tanstack/react-router";
import { type } from "arktype";
import { useAtom } from "jotai";
import { useHotkeys } from "react-hotkeys-hook";

import { datetime, toFromToDateObject } from "@hoalu/common/datetime";
import { ChevronDown, ChevronUpIcon, PlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
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
	const expenses = useExpenses();
	const [selectedRow, setSelectedRow] = useAtom(selectedExpenseAtom);

	function handleRowClick(id: string | null) {
		setSelectedRow({ id });
	}

	useHotkeys("esc", () => {
		setSelectedRow({ id: null });
	}, []);

	const expenseList = expenses.filter((expense) => {
		const range = toFromToDateObject(searchDate);
		if (range) {
			const fromDate = datetime.format(range.from, "yyyy-MM-dd");
			const toDate = datetime.format(range.to, "yyyy-MM-dd");
			const expenseDate = datetime.format(expense.date, "yyyy-MM-dd");
			return expenseDate >= fromDate && expenseDate <= toDate;
		}
		return true;
	});
	const currentIndex = expenseList.findIndex((item) => item.id === selectedRow.id);

	function handleGoUp() {
		const prevIndex = currentIndex - 1;
		const prevRowData = expenseList[prevIndex];

		if (!prevRowData) return;

		const prevRowId = prevRowData.id;
		setSelectedRow({ id: prevRowId });
	}

	function handleGoDown() {
		const nextIndex = currentIndex + 1;
		const nextRowData = expenseList[nextIndex];

		if (!nextRowData) return;

		const nextRowId = nextRowData.id;
		setSelectedRow({ id: nextRowId });
	}

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
			<SectionContent>
				<SectionContent columns={12} className="gap-0">
					<div className="col-span-4 h-[calc(100vh-98px)] overflow-hidden">
						<div className="scrollbar-thin h-full overflow-auto">
							<ExpensesList data={expenseList} onRowClick={handleRowClick} />
						</div>
					</div>
					<div className="col-span-5 h-[calc(100vh-98px)] overflow-hidden">
						<div className="flex h-full flex-col gap-x-6 gap-y-4 overflow-auto rounded-none border border-b-0 bg-card p-0 text-card-foreground">
							{selectedRow.id && (
								<div
									data-slot="expense-details-actions"
									className="flex justify-between border-b px-4 py-2"
								>
									<div className="flex items-center justify-center gap-2">
										<Button size="icon" variant="outline" onClick={handleGoUp}>
											<ChevronUpIcon className="size-4" />
										</Button>
										<Button size="icon" variant="outline" onClick={handleGoDown}>
											<ChevronDown className="size-4" />
										</Button>
									</div>
									<DeleteExpense id={selectedRow.id} />
								</div>
							)}
							<div data-slot="expense-details-form">
								{selectedRow.id && <EditExpenseForm id={selectedRow.id} />}
								{!selectedRow.id && (
									<h2 className="m-4 rounded-md bg-muted/50 p-4 text-center text-muted-foreground">
										No expenses selected
									</h2>
								)}
							</div>
						</div>
					</div>
					<div
						data-slot="expense-filter"
						className="col-span-3 flex h-[calc(100vh-98px)] flex-col gap-4 overflow-hidden px-4"
					>
						<ExpenseCalendar />
						<hr />
					</div>
				</SectionContent>
			</SectionContent>
		</Section>
	);
}
