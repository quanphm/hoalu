import { useWorkspace } from "#app/hooks/use-workspace.ts";
import {
	eventCollectionFactory,
	expenseCollectionFactory,
	recurringBillCollectionFactory,
	walletCollectionFactory,
	categoryCollectionFactory,
	exchangeRateCollection,
} from "#app/lib/collections/index.ts";
import { calculateCrossRate, lookupExchangeRate } from "@hoalu/common/exchange-rate";
import { monetary } from "@hoalu/common/monetary";
import { zeroDecimalCurrencies } from "@hoalu/countries";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { atom, useAtom } from "jotai";
import { useMemo } from "react";

export const selectedEventAtom = atom<{ id: string | null }>({ id: null });

export function useSelectedEvent() {
	const [event, setSelectedEvent] = useAtom(selectedEventAtom);
	const onSelectEvent = (id: string | null) => setSelectedEvent({ id });
	return { event, onSelectEvent };
}

function useFxRateData() {
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
	return fxRateData;
}

export function useLiveQueryEvents() {
	const workspace = useWorkspace();
	const collection = eventCollectionFactory(workspace.slug);
	const expenseCollection = expenseCollectionFactory(workspace.slug);
	const fxRateData = useFxRateData();

	const { data: events } = useLiveQuery(
		(q) =>
			q
				.from({ event: collection })
				.orderBy(({ event }) => event.created_at, "desc")
				.select(({ event }) => ({ ...event })),
		[workspace.slug],
	);

	const { data: expenses } = useLiveQuery(
		(q) =>
			q.from({ expense: expenseCollection }).select(({ expense }) => ({
				id: expense.id,
				event_id: expense.event_id,
				amount: expense.amount,
				currency: expense.currency,
				date: expense.date,
			})),
		[workspace.slug],
	);

	return useMemo(() => {
		if (!events) return [];
		const workspaceCurrency = workspace.metadata.currency as string;

		// Build a map of event_id → totalSpent (FX-converted, display units)
		const totalSpentMap = new Map<string, number>();
		for (const exp of expenses ?? []) {
			if (!exp.event_id) continue;
			const existing = totalSpentMap.get(exp.event_id) ?? 0;

			let convertedAmount = monetary.fromRealAmount(Number(exp.amount), exp.currency);
			if (exp.currency !== workspaceCurrency) {
				const date = exp.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
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
								exchangeRate: `${match.exchangeRate}`,
								inverseRate: `${match.inverseRate}`,
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
					[exp.currency, workspaceCurrency],
					date,
				);
				const isNoCent = zeroDecimalCurrencies.find((c) => c === exp.currency);
				const factor = isNoCent ? 1 : 100;
				convertedAmount =
					Number(exp.amount) * ((exchangeRate ? Number(exchangeRate.exchangeRate) : 0) / factor);
			}

			totalSpentMap.set(exp.event_id, existing + convertedAmount);
		}

		return events.map((e) => {
			return {
				...e,
				totalSpent: totalSpentMap.get(e.id) ?? 0,
				budget: monetary.fromRealAmount(Number(e.budget), e.budget_currency),
				realBudget: Number(e.budget),
			};
		});
	}, [events, expenses, fxRateData, workspace.metadata.currency]);
}

export type SyncedEvent = ReturnType<typeof useLiveQueryEvents>[number];
export type SyncedEvents = ReturnType<typeof useLiveQueryEvents>;

/**
 * Expenses filtered by event_id — for the event detail page.
 * Same join/transform pattern as useLiveQueryExpenses.
 */
export function useLiveQueryEventExpenses(eventId: string) {
	const workspace = useWorkspace();
	const expenseCollection = expenseCollectionFactory(workspace.slug);
	const walletCollection = walletCollectionFactory(workspace.slug);
	const categoryCollection = categoryCollectionFactory(workspace.slug);
	const fxRateData = useFxRateData();

	const { data } = useLiveQuery(
		(q) =>
			q
				.from({ expense: expenseCollection })
				.innerJoin({ wallet: walletCollection }, ({ expense, wallet }) =>
					eq(expense.wallet_id, wallet.id),
				)
				.leftJoin({ category: categoryCollection }, ({ expense, category }) =>
					eq(expense.category_id, category.id),
				)
				.where(({ expense }) => eq(expense.event_id, eventId))
				.orderBy(({ expense }) => expense.date, "desc")
				.select(({ expense, wallet, category }) => ({
					...expense,
					wallet: {
						id: wallet.id,
						name: wallet.name,
						description: wallet.description,
						currency: wallet.currency,
						type: wallet.type,
						isActive: wallet.is_active,
					},
					category: category
						? {
								id: category.id,
								name: category.name,
								description: category.description,
								color: category.color,
							}
						: null,
				})),
		[workspace.slug, eventId],
	);

	return useMemo(() => {
		if (!data) return [];
		return data.map((exp) => {
			const amount = monetary.fromRealAmount(Number(exp.amount), exp.currency);
			return {
				...exp,
				amount,
				realAmount: Number(exp.amount),
				convertedAmount: amount, // simplified — full FX conversion can be added if needed
			};
		});
	}, [data]);
}

export type SyncedEventExpense = ReturnType<typeof useLiveQueryEventExpenses>[number];

/**
 * Recurring bills filtered by event_id — for the event detail page.
 */
export function useLiveQueryEventRecurringBills(eventId: string) {
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
				.where(({ bill }) => eq(bill.event_id, eventId))
				.orderBy(({ bill }) => bill.created_at, "desc")
				.select(({ bill, wallet, category }) => ({
					...bill,
					wallet_name: wallet.name,
					category_name: category?.name ?? null,
					category_color: category?.color ?? null,
				})),
		[workspace.slug, eventId],
	);

	return useMemo(() => {
		if (!data) return [];
		return data.map((b) => ({
			...b,
			amount: monetary.fromRealAmount(Number(b.amount), b.currency),
			realAmount: Number(b.amount),
		}));
	}, [data]);
}

export type SyncedEventBill = ReturnType<typeof useLiveQueryEventRecurringBills>[number];
