import { type } from "arktype";
import { currencySchema, isoDateSchema } from "../../common/schema";

export const ExchangeRateSchema = type({
	date: isoDateSchema,
	from: currencySchema,
	to: currencySchema,
	rate: "string.numeric.parse",
	inverse_rate: "string.numeric.parse",
});

export type ExchangeRateSchema = typeof ExchangeRateSchema.in.infer;
