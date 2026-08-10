import { eq, useLiveQuery } from "@tanstack/react-db";
import { useMemo } from "react";

import { useFxRateData } from "#app/hooks/use-fx-rate-data.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import {
	categoryCollectionFactory,
	expenseCollectionFactory,
	walletCollectionFactory,
} from "#app/lib/collections/index.ts";
import { buildFxRateIndex, convertTransactions } from "#app/services/dashboard-model.ts";

export function useLiveQueryExpenses() {
	const workspace = useWorkspace();
	const expenseCollection = expenseCollectionFactory(workspace.slug);
	const categoryCollection = categoryCollectionFactory(workspace.slug);
	const walletCollection = walletCollectionFactory(workspace.slug);

	const { data: expensesData } = useLiveQuery(
		(q) => {
			return q
				.from({ expense: expenseCollection })
				.innerJoin({ wallet: walletCollection }, ({ expense, wallet }) =>
					eq(expense.wallet_id, wallet.id),
				)
				.leftJoin({ category: categoryCollection }, ({ expense, category }) =>
					eq(expense.category_id, category.id),
				)
				.orderBy(({ expense }) => expense.date, "desc")
				.orderBy(({ expense }) => expense.amount, "desc")
				.select(({ expense, wallet, category }) => ({
					...expense,
					category: {
						id: category?.id,
						name: category?.name,
						color: category?.color,
					},
					wallet: {
						id: wallet.id,
						name: wallet.name,
						type: wallet.type,
					},
				}));
		},
		[workspace.slug],
	);

	const fxRateData = useFxRateData();

	const fxRateIndex = useMemo(() => buildFxRateIndex(fxRateData ?? []), [fxRateData]);

	const transformedExpenses = useMemo(() => {
		return convertTransactions(expensesData ?? [], fxRateIndex, workspace.metadata.currency);
	}, [expensesData, fxRateIndex, workspace.metadata.currency]);

	return transformedExpenses;
}

type SyncedExpenses = ReturnType<typeof useLiveQueryExpenses>;
export type SyncedExpense = SyncedExpenses[number];
