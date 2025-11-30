import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import * as z from "zod";

import { CurrencySchema, IsoDateSchema } from "@hoalu/common/schema";

const SelectExchangeRateSchema = z.object({
	from_currency: CurrencySchema,
	to_currency: CurrencySchema,
	exchange_rate: z.coerce.number(),
	inverse_rate: z.coerce.number(),
	valid_from: IsoDateSchema,
	valid_to: IsoDateSchema,
});

export const exchangeRateCollection = createCollection(
	electricCollectionOptions({
		getKey: (item) => `${item.from_currency}-${item.to_currency}-${item.valid_from}`,
		shapeOptions: {
			url: `${import.meta.env.PUBLIC_API_URL}/sync/exchange-rates`,
			// @ts-expect-error
			fetchClient: (req: RequestInfo, init: RequestInit) => {
				return fetch(req, { ...init, credentials: "include" });
			},
		},
		schema: SelectExchangeRateSchema,
	}),
);
