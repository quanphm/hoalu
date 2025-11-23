import { and, between, eq, inArray, or, sql } from "drizzle-orm";

import { datetime } from "@hoalu/common/datetime";
import {
	calculateCrossRate,
	type ExchangeRate,
	type ExchangeRateProvider,
	lookupExchangeRate,
} from "@hoalu/common/exchange-rate";

import { db, schema } from "#api/db/index.ts";

export class ExchangeRateRepository implements ExchangeRateProvider {
	async findDirect(
		[from = "USD", to]: [string, string],
		date?: string,
	): Promise<ExchangeRate | null> {
		const lookupDate = date ? sql`${date}` : sql`CURRENT_DATE`;
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

		if (!queryData[0]) return null;

		const { fromCurrency, toCurrency, exchangeRate, inverseRate } = queryData[0];
		const today = new Date().toISOString();
		const returnedDate = datetime.format(date || today, "yyyy-MM-dd");

		return {
			date: returnedDate,
			fromCurrency,
			toCurrency,
			exchangeRate,
			inverseRate,
		};
	}

	async findCrossRate([from, to]: [string, string], date?: string): Promise<ExchangeRate | null> {
		const lookupDate = date ? sql`${date}` : sql`CURRENT_DATE`;
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
					eq(schema.fxRate.fromCurrency, "USD"),
					inArray(schema.fxRate.toCurrency, [from, to]),
				),
			);

		const rates = calculateCrossRate({
			pair: [from, to],
			usdToFrom: usdRates.find((rate) => rate.toCurrency === from),
			usdToTo: usdRates.find((rate) => rate.toCurrency === to),
		});
		const today = new Date().toISOString();
		const returnedDate = datetime.format(date || today, "yyyy-MM-dd");

		if (!rates) return null;

		return {
			...rates,
			date: returnedDate,
		};
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
