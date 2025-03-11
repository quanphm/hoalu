import { and, between, eq, inArray, or, sql } from "drizzle-orm";
import { db, schema } from "../../db";

export class ExchangeRateRepository {
	async find({ from = "USD", to }: { from?: string; to: string }) {
		const queryData = await db
			.select()
			.from(schema.fxRate)
			.where(
				and(
					between(sql`CURRENT_DATE`, schema.fxRate.validFrom, schema.fxRate.validTo),
					or(
						and(eq(schema.fxRate.fromCurrency, from), eq(schema.fxRate.toCurrency, to)),
						and(eq(schema.fxRate.fromCurrency, to), eq(schema.fxRate.toCurrency, from)),
					),
				),
			)
			.limit(1);

		if (!queryData[0]) return null;

		return queryData[0];
	}

	async crossRate([from, to]: [string, string]) {
		const usdRates = await db
			.select({
				toCurrency: schema.fxRate.toCurrency,
				exchangeRate: schema.fxRate.exchangeRate,
				inverseRate: schema.fxRate.inverseRate,
			})
			.from(schema.fxRate)
			.where(
				and(
					eq(schema.fxRate.fromCurrency, "USD"),
					inArray(schema.fxRate.toCurrency, [from, to]),
					between(sql`CURRENT_DATE`, schema.fxRate.validFrom, schema.fxRate.validTo),
				),
			);

		const usdOfFrom = usdRates.find((rate) => rate.toCurrency === from);
		const usdOfTo = usdRates.find((rate) => rate.toCurrency === to);

		if (usdOfFrom && usdOfTo) {
			return {
				fromCurrency: from,
				toCurrency: to,
				exchangeRate: `${Number.parseFloat(usdOfFrom.inverseRate) * Number.parseFloat(usdOfTo.exchangeRate)}`,
				inverseRate: `${Number.parseFloat(usdOfTo.inverseRate) * Number.parseFloat(usdOfFrom.exchangeRate)}`,
			};
		}

		return null;
	}
}
