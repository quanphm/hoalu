import { CurrencySchema, IsoDateSchema } from "@hoalu/common/schema";
import * as z from "zod";

export const ExchangeRateSchema = z.object({
	date: IsoDateSchema,
	from: CurrencySchema,
	to: CurrencySchema,
	rate: z.coerce.number(),
	inverse_rate: z.coerce.number(),
});
