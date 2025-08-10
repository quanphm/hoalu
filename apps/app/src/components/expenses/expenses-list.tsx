import { useSetAtom } from "jotai";
import { memo } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { datetime } from "@hoalu/common/datetime";
import { selectedExpenseAtom } from "@/atoms";
import ExpenseContent from "@/components/expenses/expense-content";
import { formatCurrency } from "@/helpers/currency";
import { useExpenses } from "@/hooks/use-expenses";
import { useWorkspace } from "@/hooks/use-workspace";
import type { ExpenseWithClientConvertedSchema } from "@/lib/schema";

function ExpensesList() {
	const { data: expenses } = useExpenses();
	const setSelectedRow = useSetAtom(selectedExpenseAtom);

	function handleRowClick(id: string | null) {
		setSelectedRow({ id });
	}

	useHotkeys("esc", () => handleRowClick(null), []);

	if (expenses.length === 0) {
		return (
			<p className="mx-4 rounded-lg bg-muted p-4 text-center text-base text-muted-foreground">
				No expenses found
			</p>
		);
	}

	const groupedExpensesByDate = new Map<string, ExpenseWithClientConvertedSchema[]>();
	expenses.forEach((expense) => {
		const dateKey = datetime.format(expense.date, "yyyy-MM-dd");
		if (!groupedExpensesByDate.has(dateKey)) {
			groupedExpensesByDate.set(dateKey, []);
		}
		const expensesForDate = groupedExpensesByDate.get(dateKey);
		if (expensesForDate) {
			expensesForDate.push(expense);
		}
	});

	return Array.from(groupedExpensesByDate.entries()).map(([date, value]) => (
		<div key={date} data-slot="expense-group">
			<div
				data-slot="expense-group-title"
				className="sticky top-0 z-2 flex items-center border-muted bg-muted py-2 pr-6 pl-3 text-xs"
			>
				<div className="flex items-center gap-1 font-semibold">
					{datetime.format(date, "dd/MM/yyyy")}
				</div>
				<div className="ml-auto">
					<TotalExpenseByDate data={value} />
				</div>
			</div>
			<div data-slot="expense-group-content" className="flex flex-col">
				{value.map((expense) => {
					return <ExpenseContent key={expense.id} {...expense} onClick={handleRowClick} />;
				})}
			</div>
		</div>
	));
}

export default memo(ExpensesList);

interface TotalExpenseByDateProps {
	data: ExpenseWithClientConvertedSchema[];
}
function TotalExpenseByDate(props: TotalExpenseByDateProps) {
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
