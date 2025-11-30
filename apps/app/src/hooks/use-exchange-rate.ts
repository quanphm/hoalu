import { useLiveQuery } from "@tanstack/react-db";
import * as z from "zod";

import { CurrencySchema } from "@hoalu/common/schema";

import { exchangeRateCollection } from "#app/lib/collections/exchange-rate.ts";

const Schema = z.array(
	z.object({
		from: CurrencySchema,
		to: CurrencySchema,
		rate: z.coerce.number(),
		inverseRate: z.coerce.number(),
		validFrom: z.coerce.date().pipe(z.transform((val) => val.toISOString())),
		validTo: z.coerce.date().pipe(z.transform((val) => val.toISOString())),
	}),
);

export function useLiveQueryExchangeRate() {
	const { data } = useLiveQuery((q) => {
		return q.from({ exchangeRate: exchangeRateCollection }).fn.select(({ exchangeRate }) => ({
			from: exchangeRate.from_currency,
			to: exchangeRate.to_currency,
			rate: exchangeRate.exchange_rate,
			inverseRate: exchangeRate.inverse_rate,
			validFrom: exchangeRate.valid_from,
			validTo: exchangeRate.valid_to,
		}));
	});

	return Schema.parse(data);
}
