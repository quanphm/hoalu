import { useValue } from "@legendapp/state/react";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { useMemo } from "react";

import { selectedIncome$ } from "#app/atoms/index.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import {
	categoryCollectionFactory,
	exchangeRateCollection,
	incomeCollectionFactory,
	walletCollectionFactory,
} from "#app/lib/collections/index.ts";
import { buildFxRateIndex, convertTransactions } from "#app/services/dashboard-model.ts";

export function useSelectedIncome() {
	const income = useValue(selectedIncome$);
	const setSelectedIncome = selectedIncome$.set;
	const onSelectIncome = (id: string | null) => {
		setSelectedIncome({ id });
	};
	return { income, onSelectIncome };
}

export function useLiveQueryIncomes() {
	const workspace = useWorkspace();
	const incomeCollection = incomeCollectionFactory(workspace.slug);
	const categoryCollection = categoryCollectionFactory(workspace.slug);
	const walletCollection = walletCollectionFactory(workspace.slug);

	const { data: incomesData } = useLiveQuery(
		(q) => {
			return q
				.from({ income: incomeCollection })
				.innerJoin({ wallet: walletCollection }, ({ income, wallet }) =>
					eq(income.wallet_id, wallet.id),
				)
				.leftJoin({ category: categoryCollection }, ({ income, category }) =>
					eq(income.category_id, category.id),
				)
				.orderBy(({ income }) => income.date, "desc")
				.orderBy(({ income }) => income.amount, "desc")
				.select(({ income, wallet, category }) => ({
					...income,
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

	const { data: fxRateData } = useLiveQuery((q) => {
		return q.from({ fxRate: exchangeRateCollection }).fn.select(({ fxRate }) => ({
			from: fxRate.from_currency,
			to: fxRate.to_currency,
			exchangeRate: `${fxRate.exchange_rate}`,
			inverseRate: `${fxRate.inverse_rate}`,
			validFrom: fxRate.valid_from,
			validTo: fxRate.valid_to,
		}));
	});

	const fxRateIndex = useMemo(() => buildFxRateIndex(fxRateData), [fxRateData]);

	const transformedIncomes = useMemo(() => {
		if (!incomesData) return [];
		return convertTransactions(incomesData, fxRateIndex, workspace.metadata.currency);
	}, [incomesData, fxRateIndex, workspace.metadata.currency]);

	return transformedIncomes;
}

export type SyncedIncomes = ReturnType<typeof useLiveQueryIncomes>;
export type SyncedIncome = SyncedIncomes[number];
