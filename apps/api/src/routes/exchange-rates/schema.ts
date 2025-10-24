import * as z from "zod";

import { CurrencySchema, IsoDateSchema } from "#api/common/schema.ts";

export const ExchangeRateSchema = z.object({
	date: IsoDateSchema,
	from: CurrencySchema,
	to: CurrencySchema,
	rate: z.coerce.number(),
	inverse_rate: z.coerce.number(),
});
