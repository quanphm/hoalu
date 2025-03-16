import { type } from "arktype";
import { currencySchema, isoDateSchema } from "../../common/schema";

export const exchangeRateSchema = type({
	date: isoDateSchema,
	from: currencySchema,
	to: currencySchema,
	rate: "string.numeric.parse",
	inverse_rate: "string.numeric.parse",
});
