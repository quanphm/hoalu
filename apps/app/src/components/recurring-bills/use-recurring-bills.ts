import { zeroDecimalCurrencies } from "@hoalu/countries";
import { calculateCrossRate, lookupExchangeRate } from "@hoalu/finance/exchange-rate";
import { monetary } from "@hoalu/finance/monetary";
import { observable } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { createLiveQueryCollection, eq, useLiveQuery } from "@tanstack/react-db";
import { useMemo } from "react";

import { useFxRateData } from "#app/hooks/use-fx-rate-data.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { createDerivedViewCache } from "#app/lib/collections/derived-view-cache.ts";
import {
	categoryCollectionFactory,
	recurringBillCollectionFactory,
	walletCollectionFactory,
} from "#app/lib/collections/index.ts";

import type { FxRateRow } from "#app/services/dashboard-model.ts";

export const REPEAT_ORDER = ["daily", "weekly", "monthly", "yearly", "one-time"];

export const selectedRecurringBillAtom$ = observable<{ id: string | null }>({ id: null });

export function useSelectedRecurringBill() {
	const bill = useValue(selectedRecurringBillAtom$);
	const onSelectBill = (id: string | null) => selectedRecurringBillAtom$.set({ id });
	return { bill, onSelectBill };
}

function buildBillsView(slug: string) {
	const collection = recurringBillCollectionFactory(slug);
	const walletCollection = walletCollectionFactory(slug);
	const categoryCollection = categoryCollectionFactory(slug);

	return createLiveQueryCollection({
		startSync: true,
		query: (q) =>
			q
				.from({ bill: collection })
				.innerJoin({ wallet: walletCollection }, ({ bill, wallet }) =>
					eq(bill.wallet_id, wallet.id),
				)
				.leftJoin({ category: categoryCollection }, ({ bill, category }) =>
					eq(bill.category_id, category.id),
				)
				.orderBy(({ bill }) => bill.created_at, "desc")
				.select(({ bill, wallet, category }) => ({
					...bill,
					wallet_name: wallet.name,
					wallet_type: wallet.type,
					category_name: category?.name ?? null,
					category_color: category?.color ?? null,
				})),
	});
}

const billViews = createDerivedViewCache(buildBillsView);

function getBillsView(slug: string) {
	return billViews.get(slug);
}

export function preloadBillsView(slug: string) {
	void getBillsView(slug).preload();
}

export function clearBillsView(slug?: string) {
	if (slug) {
		billViews.delete(slug);
		return;
	}
	billViews.clear();
}

interface ConvertibleBill {
	amount: unknown;
	currency: string;
	anchor_date: string | null;
}

function convertBill(bill: ConvertibleBill, fxRateData: FxRateRow[], workspaceCurrency: string) {
	const amount = monetary.fromRealAmount(Number(bill.amount), bill.currency);
	const date = bill.anchor_date ?? new Date().toISOString().slice(0, 10);

	let convertedAmount = amount;
	if (bill.currency !== workspaceCurrency) {
		const exchangeRate = lookupExchangeRate(
			{
				findDirect: ([from, to], d) => {
					const match = fxRateData.find((rate) => {
						const inRange =
							new Date(rate.validFrom) <= new Date(d) && new Date(d) <= new Date(rate.validTo);
						const correctPair =
							(rate.from === from && rate.to === to) || (rate.from === to && rate.to === from);
						return inRange && correctPair;
					});
					if (!match) return null;
					return {
						fromCurrency: match.from,
						toCurrency: match.to,
						exchangeRate: match.exchangeRate,
						inverseRate: match.inverseRate,
					};
				},
				findCrossRate: ([from, to], d) => {
					const usdRates = fxRateData.filter((rate) => {
						const inRange =
							new Date(rate.validFrom) <= new Date(d) && new Date(d) <= new Date(rate.validTo);
						return inRange && (rate.to === from || rate.to === to);
					});
					return calculateCrossRate({
						pair: [from, to],
						usdToFrom: usdRates.find((r) => r.to === from),
						usdToTo: usdRates.find((r) => r.to === to),
					});
				},
			},
			[bill.currency, workspaceCurrency],
			date,
		);

		const isNoCent = zeroDecimalCurrencies.find((c) => c === bill.currency);
		const factor = isNoCent ? 1 : 100;
		convertedAmount =
			Number(bill.amount) * ((exchangeRate ? exchangeRate.exchangeRate : 0) / factor);
	}

	return { amount, realAmount: Number(bill.amount), convertedAmount };
}

export function useLiveQueryRecurringBills() {
	const workspace = useWorkspace();
	const { data } = useLiveQuery(getBillsView(workspace.slug));
	const fxRateData = useFxRateData();

	return useMemo(() => {
		if (!data) return [];
		return data
			.filter((bill) => bill.is_active)
			.map((bill) => ({
				...bill,
				...convertBill(bill, fxRateData, workspace.metadata.currency),
			}));
	}, [data, fxRateData, workspace.metadata.currency]);
}

export type SyncedRecurringBill = ReturnType<typeof useLiveQueryRecurringBills>[number];

export function useAllRecurringBills() {
	const workspace = useWorkspace();
	const { data } = useLiveQuery(getBillsView(workspace.slug));
	const fxRateData = useFxRateData();

	return useMemo(() => {
		if (!data) return [];
		return data.map((bill) => ({
			...bill,
			...convertBill(bill, fxRateData, workspace.metadata.currency),
		}));
	}, [data, fxRateData, workspace.metadata.currency]);
}

export type SyncedAllRecurringBill = ReturnType<typeof useAllRecurringBills>[number];

/**
 * Returns bills sorted in the same grouped display order used by the list:
 * daily → weekly → monthly → yearly → one-time, with each group's internal
 * order preserved (created_at desc from the live query).
 *
 * Use this anywhere you need an ordered flat list for navigation, so that
 * j/k buttons always move in the same order the user sees on screen.
 */
export function useSortedRecurringBills() {
	const bills = useLiveQueryRecurringBills();

	return useMemo(() => {
		const grouped = new Map<string, SyncedRecurringBill[]>();
		for (const bill of bills) {
			const existing = grouped.get(bill.repeat);
			if (existing) {
				existing.push(bill);
			} else {
				grouped.set(bill.repeat, [bill]);
			}
		}

		const sortedKeys = Array.from(grouped.keys()).sort((a, b) => {
			const ai = REPEAT_ORDER.indexOf(a);
			const bi = REPEAT_ORDER.indexOf(b);
			return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
		});

		return sortedKeys.flatMap((key) => grouped.get(key)!);
	}, [bills]);
}
