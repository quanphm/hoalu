import { useSuspenseQuery } from "@tanstack/react-query";

import { datetime } from "@hoalu/common/datetime";
import type { ExpenseWithClientConvertedSchema } from "@/lib/schema";
import { expensesQueryOptions } from "@/services/query-options";
import { useWorkspace } from "./use-workspace";

export function useExpenses() {
	const { slug } = useWorkspace();
	const { data } = useSuspenseQuery({
		...expensesQueryOptions(slug),
		select: (expenses) => {
			return expenses.map((expense) => {
				return {
					...expense,
					date: datetime.format(expense.date, "yyyy-MM-dd"),
				} as ExpenseWithClientConvertedSchema;
			});
		},
	});
	return data;
}
