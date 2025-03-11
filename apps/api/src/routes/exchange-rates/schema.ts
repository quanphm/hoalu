import { type } from "arktype";

export const exchangeRateSchema = type({
	date: "string",
	from: "string > 0",
	to: "string > 0",
	rate: "string.numeric.parse",
	inverse_rate: "string.numeric.parse",
});
