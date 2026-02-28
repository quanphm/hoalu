import { useWorkspace } from "#app/hooks/use-workspace.ts";
import {
	categoryCollectionFactory,
	exchangeRateCollection,
	recurringBillCollectionFactory,
	walletCollectionFactory,
} from "#app/lib/collections/index.ts";
import { calculateCrossRate, lookupExchangeRate } from "@hoalu/common/exchange-rate";
import { monetary } from "@hoalu/common/monetary";
import { zeroDecimalCurrencies } from "@hoalu/countries";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { useAtom } from "jotai";
import { atom } from "jotai";
import { useMemo } from "react";

export const selectedRecurringBillAtom = atom<{ id: string | null }>({ id: null });

export function useSelectedRecurringBill() {
	const [bill, setSelectedBill] = useAtom(selectedRecurringBillAtom);
	const onSelectBill = (id: string | null) => setSelectedBill({ id });
	return { bill, onSelectBill };
}

export function useLiveQueryRecurringBills() {
	const workspace = useWorkspace();
	const collection = recurringBillCollectionFactory(workspace.slug);
	const walletCollection = walletCollectionFactory(workspace.slug);
	const categoryCollection = categoryCollectionFactory(workspace.slug);

	const { data } = useLiveQuery(
		(q) =>
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
					category_name: category?.name ?? null,
					category_color: category?.color ?? null,
				})),
		[workspace.slug],
	);

	const { data: fxRateData } = useLiveQuery((q) =>
		q.from({ fxRate: exchangeRateCollection }).fn.select(({ fxRate }) => ({
			from: fxRate.from_currency,
			to: fxRate.to_currency,
			exchangeRate: `${fxRate.exchange_rate}`,
			inverseRate: `${fxRate.inverse_rate}`,
			validFrom: fxRate.valid_from,
			validTo: fxRate.valid_to,
		})),
	);

	return useMemo(() => {
		if (!data) return [];
		return (
			data
				// .filter((b) => b.is_active)
				.map((b) => {
					const amount = monetary.fromRealAmount(Number(b.amount), b.currency);
					const workspaceCurrency = workspace.metadata.currency;
					const date = b.anchor_date ?? new Date().toISOString().slice(0, 10);

					let convertedAmount = amount;
					if (b.currency !== workspaceCurrency) {
						const exchangeRate = lookupExchangeRate(
							{
								findDirect: ([from, to], d) => {
									const match = fxRateData.find((rate) => {
										const inRange =
											new Date(rate.validFrom) <= new Date(d) &&
											new Date(d) <= new Date(rate.validTo);
										const correctPair =
											(rate.from === from && rate.to === to) ||
											(rate.from === to && rate.to === from);
										return inRange && correctPair;
									});
									if (!match) return null;
									return {
										fromCurrency: match.from,
										toCurrency: match.to,
										exchangeRate: `${match.exchangeRate}`,
										inverseRate: `${match.inverseRate}`,
									};
								},
								findCrossRate: ([from, to], d) => {
									const usdRates = fxRateData.filter((rate) => {
										const inRange =
											new Date(rate.validFrom) <= new Date(d) &&
											new Date(d) <= new Date(rate.validTo);
										return inRange && (rate.to === from || rate.to === to);
									});
									return calculateCrossRate({
										pair: [from, to],
										usdToFrom: usdRates.find((r) => r.to === from),
										usdToTo: usdRates.find((r) => r.to === to),
									});
								},
							},
							[b.currency, workspaceCurrency],
							date,
						);

						const isNoCent = zeroDecimalCurrencies.find((c) => c === b.currency);
						const factor = isNoCent ? 1 : 100;
						convertedAmount =
							Number(b.amount) * ((exchangeRate ? Number(exchangeRate.exchangeRate) : 0) / factor);
					}

					return {
						...b,
						amount,
						realAmount: Number(b.amount),
						convertedAmount,
					};
				})
		);
	}, [data, fxRateData, workspace.metadata.currency]);
}

export type SyncedRecurringBill = ReturnType<typeof useLiveQueryRecurringBills>[number];
