import type { ExpenseWithClientConvertedSchema } from "@/lib/schema";
import { expenseKeys } from "@/services/query-key-factory";
import { exchangeRatesQueryOptions, expensesQueryOptions } from "@/services/query-options";
import { date } from "@hoalu/common/datetime";
import { zeroDecimalCurrencies } from "@hoalu/countries";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useWorkspace } from "./use-workspace";

export function useExpenses() {
	const queryClient = useQueryClient();
	const {
		slug,
		metadata: { currency: workspaceCurrency },
	} = useWorkspace();
	const { data: expenses } = useSuspenseQuery(expensesQueryOptions(slug));
	const { data } = useSuspenseQuery({
		queryKey: expenseKeys.withCurrencyConverted(slug),
		queryFn: async () => {
			const promises = expenses.map(async (expense) => {
				const { realAmount, currency: sourceCurrency } = expense;
				try {
					const result = await queryClient.fetchQuery(
						exchangeRatesQueryOptions({ from: sourceCurrency, to: workspaceCurrency }),
					);

					const isNoCent = zeroDecimalCurrencies.find((c) => c === sourceCurrency);
					const factor = isNoCent ? 1 : 100;
					const convertedAmount = realAmount * (result.rate / factor);

					return {
						...expense,
						date: date.format(expense.date, "d MMM yyyy"),
						convertedAmount: convertedAmount,
					};
				} catch {
					return {
						...expense,
						date: date.format(expense.date, "d MMM yyyy"),
						convertedAmount: -1,
					};
				}
			});
			const result = await Promise.all(promises);
			return result;
		},
	});
	return data as ExpenseWithClientConvertedSchema[];
}
