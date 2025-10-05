import * as z from "zod";

import { CurrencySchema, IsoDateSchema } from "../../common/schema";

export const ExchangeRateSchema = z.object({
	date: IsoDateSchema,
	from: CurrencySchema,
	to: CurrencySchema,
	rate: z.coerce.number(),
	inverse_rate: z.coerce.number(),
});
