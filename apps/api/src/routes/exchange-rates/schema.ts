import { type } from "arktype";

import { CurrencySchema, IsoDateSchema } from "../../common/schema";

export const ExchangeRateSchema = type({
	date: IsoDateSchema,
	from: CurrencySchema,
	to: CurrencySchema,
	rate: "string.numeric.parse",
	inverse_rate: "string.numeric.parse",
});

export type ExchangeRateSchema = typeof ExchangeRateSchema.in.infer;
