import { type } from "arktype";

const rateSchema = type({
	"[string]": "string.numeric.parse",
});

export const exchangeRateSchema = type({
	date: "string",
	from: "string > 0",
	rates: rateSchema.array(),
});
