import { useSuspenseQuery } from "@tanstack/react-query";

import { datetime } from "@hoalu/common/datetime";
import type { ExpenseWithClientConvertedSchema } from "@/lib/schema";
import { expensesQueryOptions } from "@/services/query-options";
import { useWorkspace } from "./use-workspace";

interface Options<T extends boolean = false> {
	groupByDate: T;
}

export function useExpenses(
	options: Options<true>,
): Map<string, ExpenseWithClientConvertedSchema[]>;
export function useExpenses<T extends boolean>(
	options: Options<T>,
): ExpenseWithClientConvertedSchema[];
export function useExpenses<T extends boolean>(options: Options<T>) {
	const { slug } = useWorkspace();
	const { data } = useSuspenseQuery({
		...expensesQueryOptions(slug),
		select: (expenses) => {
			if (options.groupByDate) {
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
				return groupedExpensesByDate;
			}

			return expenses.map(
				(expense) =>
					({
						...expense,
						date: datetime.format(expense.date, "yyyy-MM-dd"),
					}) as ExpenseWithClientConvertedSchema,
			);
		},
	});

	return data;
}
