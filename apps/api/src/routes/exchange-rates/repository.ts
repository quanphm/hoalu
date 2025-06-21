import { and, between, eq, inArray, or, sql } from "drizzle-orm";

import { datetime } from "@hoalu/common/datetime";
import { db, schema } from "../../db";

interface ReturnRate {
	date: string;
	fromCurrency: string;
	toCurrency: string;
	exchangeRate: string;
	inverseRate: string;
}

export class ExchangeRateRepository {
	async _find([from = "USD", to]: [string, string], date?: string) {
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

		return queryData[0];
	}

	async _crossRate([from, to]: [string, string], date?: string) {
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

		const usdOfFrom = usdRates.find((rate) => rate.toCurrency === from);
		const usdOfTo = usdRates.find((rate) => rate.toCurrency === to);

		if (!usdOfFrom || !usdOfTo) return null;

		return {
			fromCurrency: from,
			toCurrency: to,
			exchangeRate: `${Number.parseFloat(usdOfFrom.inverseRate) * Number.parseFloat(usdOfTo.exchangeRate)}`,
			inverseRate: `${Number.parseFloat(usdOfTo.inverseRate) * Number.parseFloat(usdOfFrom.exchangeRate)}`,
		};
	}

	async lookup([from, to]: [string, string], date?: string): Promise<ReturnRate | null> {
		const today = new Date().toISOString();
		const isSameExchange = from === to;
		const isCrossRate = from !== "USD" && to !== "USD";
		const returnedDate = datetime.format(date || today, "yyyy-MM-dd");

		/**
		 * @example VND -> VND
		 */
		if (isSameExchange) {
			return {
				date: returnedDate,
				fromCurrency: from,
				toCurrency: to,
				exchangeRate: "1",
				inverseRate: "1",
			};
		}

		/**
		 * Cross-rate exchange
		 * @example VND -> USD -> SGD || SGD -> USD -> VND
		 */
		if (isCrossRate) {
			const result = await this._crossRate([from, to], date);
			if (!result) return null;
			return {
				...result,
				date: returnedDate,
			};
		}

		/**
		 * Direct exchange
		 * @example VND -> USD || USD -> VND
		 */
		const result = await this._find([from, to], date);
		if (!result) return null;

		/**
		 * In DB, everything stored as USD -> XXX
		 * hence, this value to detect pair of XXX -> USD.
		 */
		const useInverse = from !== "USD" && to === "USD";

		return {
			...result,
			date: returnedDate,
			exchangeRate: useInverse ? result.inverseRate : result.exchangeRate,
			inverseRate: useInverse ? result.exchangeRate : result.inverseRate,
		};
	}
}
