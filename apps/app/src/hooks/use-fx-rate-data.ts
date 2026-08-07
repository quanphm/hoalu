import { useLiveQuery } from "@tanstack/react-db";

import { exchangeRateCollection } from "#app/lib/collections/index.ts";

import type { FxRateRow } from "#app/services/dashboard-model.ts";

export function useFxRateData(): FxRateRow[] | undefined {
	const { data } = useLiveQuery((q) =>
		q.from({ fxRate: exchangeRateCollection }).select(({ fxRate }) => ({
			from: fxRate.from_currency,
			to: fxRate.to_currency,
			exchangeRate: fxRate.exchange_rate,
			inverseRate: fxRate.inverse_rate,
			validFrom: fxRate.valid_from,
			validTo: fxRate.valid_to,
		})),
	);
	return data;
}
