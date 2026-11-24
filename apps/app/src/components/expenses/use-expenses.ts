import { createLiveQueryCollection, eq, useLiveQuery } from "@tanstack/react-db";
import { useMemo } from "react";

import { useFxRateData } from "#app/hooks/use-fx-rate-data.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { createDerivedViewCache } from "#app/lib/collections/derived-view-cache.ts";
import {
	categoryCollectionFactory,
	expenseCollectionFactory,
	walletCollectionFactory,
} from "#app/lib/collections/index.ts";
import { buildFxRateIndex, convertTransactions } from "#app/services/dashboard-model.ts";

function buildExpenseView(slug: string) {
	const expenseCollection = expenseCollectionFactory(slug);
	const categoryCollection = categoryCollectionFactory(slug);
	const walletCollection = walletCollectionFactory(slug);

	return createLiveQueryCollection({
		startSync: true,
		query: (q) =>
			q
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
				})),
	});
}

const expenseViews = createDerivedViewCache(buildExpenseView);

function getExpenseView(slug: string) {
	return expenseViews.get(slug);
}

export function preloadExpenseView(slug: string) {
	void getExpenseView(slug).preload();
}

export function clearExpenseView(slug?: string) {
	if (slug) {
		expenseViews.delete(slug);
		return;
	}
	expenseViews.clear();
}

export function useLiveQueryExpenses() {
	const workspace = useWorkspace();
	const view = getExpenseView(workspace.slug);

	const { data: expensesData } = useLiveQuery(view);

	const fxRateData = useFxRateData();

	const fxRateIndex = useMemo(() => buildFxRateIndex(fxRateData ?? []), [fxRateData]);

	return useMemo(
		() => convertTransactions(expensesData ?? [], fxRateIndex, workspace.metadata.currency),
		[expensesData, fxRateIndex, workspace.metadata.currency],
	);
}

type SyncedExpenses = ReturnType<typeof useLiveQueryExpenses>;
export type SyncedExpense = SyncedExpenses[number];
