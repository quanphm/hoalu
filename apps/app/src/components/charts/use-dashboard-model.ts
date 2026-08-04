import { useValue } from "@legendapp/state/react";
import { useMemo } from "react";

import { chartGroupBy$, customDateRange$, selectDateRange$ } from "#app/atoms/filters.ts";
import {
	type SyncedCategory,
	useLiveQueryCategories,
} from "#app/components/categories/use-categories.ts";
import { useLiveQueryExpenses } from "#app/components/expenses/use-expenses.ts";
import { useLiveQueryIncomes } from "#app/components/incomes/use-incomes.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { createDashboardModel, type DashboardModel } from "#app/services/dashboard-model.ts";

/**
 * The one place the dashboard reads collections and global filter observables.
 * Charts below it receive the memoized {@link DashboardModel} as props.
 */
export function useDashboardModel(): DashboardModel<SyncedCategory> {
	const expenses = useLiveQueryExpenses();
	const incomes = useLiveQueryIncomes();
	const categories = useLiveQueryCategories();
	const {
		metadata: { currency },
	} = useWorkspace();

	const dateRange = useValue(selectDateRange$);
	const customRange = useValue(customDateRange$);
	const groupBy = useValue(chartGroupBy$);

	return useMemo(
		() =>
			createDashboardModel({
				expenses,
				incomes,
				categories,
				currency,
				dateRange,
				customRange,
				groupBy,
			}),
		[expenses, incomes, categories, currency, dateRange, customRange, groupBy],
	);
}
