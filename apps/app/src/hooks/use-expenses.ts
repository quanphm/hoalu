import { useSuspenseQuery } from "@tanstack/react-query";

import { expensesQueryOptions } from "@/services/query-options";
import { useWorkspace } from "./use-workspace";

export function useExpenses() {
	const { slug } = useWorkspace();
	const { data } = useSuspenseQuery(expensesQueryOptions(slug));
	return data;
}
