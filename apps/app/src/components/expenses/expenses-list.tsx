import { memo, useEffect, useMemo } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { datetime } from "@hoalu/common/datetime";
import ExpenseContent from "@/components/expenses/expense-content";
import { formatCurrency } from "@/helpers/currency";
import { useExpenses, useSelectedExpense } from "@/hooks/use-expenses";
import { useWorkspace } from "@/hooks/use-workspace";
import type { ExpenseWithClientConvertedSchema } from "@/lib/schema";

const ExpenseGroupHeader = memo(
	({ date, expenses }: { date: string; expenses: ExpenseWithClientConvertedSchema[] }) => (
		<div
			data-slot="expense-group-title"
			className="sticky top-0 z-2 flex items-center border-muted bg-muted py-2 pr-6 pl-3 text-xs"
		>
			<div className="flex items-center gap-1 font-semibold">
				{datetime.format(date, "dd/MM/yyyy")}
			</div>
			<div className="ml-auto">
				<TotalExpenseByDate data={expenses} />
			</div>
		</div>
	),
);

const EmptyExpensesState = memo(() => (
	<p className="mx-4 rounded-lg bg-muted p-4 text-center text-base text-muted-foreground">
		No expenses found
	</p>
));

function TotalExpenseByDate(props: { data: ExpenseWithClientConvertedSchema[] }) {
	const {
		metadata: { currency: workspaceCurrency },
	} = useWorkspace();
	const total = props.data.reduce((sum, current) => {
		const value = current.convertedAmount;
		return sum + (typeof value === "number" ? value : 0);
	}, 0);

	return (
		<span className="font-semibold text-base text-destructive tracking-tight">
			{formatCurrency(total as number, workspaceCurrency)}
		</span>
	);
}

function ExpensesList() {
	const { data: expenses } = useExpenses();
	const { onSelectExpense } = useSelectedExpense();

	useHotkeys("esc", () => onSelectExpense(null), []);

	useEffect(() => {
		return () => {
			onSelectExpense(null);
		};
	}, []);

	const groupedExpensesByDate = useMemo(() => {
		const grouped = new Map<string, ExpenseWithClientConvertedSchema[]>();
		expenses.forEach((expense) => {
			const dateKey = datetime.format(expense.date, "yyyy-MM-dd");
			const existing = grouped.get(dateKey);
			if (existing) {
				existing.push(expense);
			} else {
				grouped.set(dateKey, [expense]);
			}
		});
		return Array.from(grouped.entries());
	}, [expenses]);

	if (expenses.length === 0) {
		return <EmptyExpensesState />;
	}

	return groupedExpensesByDate.map(([date, expenses]) => (
		<div key={date} data-slot="expense-group">
			<ExpenseGroupHeader date={date} expenses={expenses} />
			<div data-slot="expense-group-content" className="flex flex-col">
				{expenses.map((expense) => {
					return <ExpenseContent key={expense.id} {...expense} onClick={onSelectExpense} />;
				})}
			</div>
		</div>
	));
}

export default memo(ExpensesList);
