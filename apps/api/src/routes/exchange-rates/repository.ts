import { db, schema } from "#api/db/index.ts";
import {
	calculateCrossRate,
	type ExchangeRate,
	type ExchangeRateProvider,
	lookupExchangeRate,
} from "@hoalu/common/exchange-rate";
import { and, between, eq, inArray, or, sql } from "drizzle-orm";

export class ExchangeRateRepository implements ExchangeRateProvider {
	async findDirect([from, to]: [string, string], date: string): Promise<ExchangeRate | null> {
		const lookupDate = sql`${date}`;
		const queryData = await db
			.select()
			.from(schema.fxRate)
			.where(
				and(
					between(lookupDate, schema.fxRate.validFrom, schema.fxRate.validTo),
					or(
						and(eq(schema.fxRate.fromCurrency, from), eq(schema.fxRate.toCurrency, to)),
						and(eq(schema.fxRate.fromCurrency, to), eq(schema.fxRate.toCurrency, from)),
					),
				),
			)
			.limit(1);

		return queryData[0];
	}

	async findCrossRate([from, to]: [string, string], date: string): Promise<ExchangeRate | null> {
		const lookupDate = sql`${date}`;
		const usdRates = await db
			.select({
				toCurrency: schema.fxRate.toCurrency,
				exchangeRate: schema.fxRate.exchangeRate,
				inverseRate: schema.fxRate.inverseRate,
			})
			.from(schema.fxRate)
			.where(
				and(
					between(lookupDate, schema.fxRate.validFrom, schema.fxRate.validTo),
					inArray(schema.fxRate.toCurrency, [from, to]),
				),
			);

		const rates = calculateCrossRate({
			pair: [from, to],
			usdToFrom: usdRates.find((rate) => rate.toCurrency === from),
			usdToTo: usdRates.find((rate) => rate.toCurrency === to),
		});

		return rates;
	}

	async lookup([from, to]: [string, string], date: string): Promise<ExchangeRate | null> {
		return lookupExchangeRate(
			{
				findDirect: this.findDirect,
				findCrossRate: this.findCrossRate,
			},
			[from, to],
			date,
		);
	}
}
