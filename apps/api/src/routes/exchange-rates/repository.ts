import { and, between, eq, sql } from "drizzle-orm";
import { db, schema } from "../../db";

export class ExchangeRateRepository {
	async find({ from = "USD", to }: { from?: string; to: string }) {
		const queryData = await db
			.select()
			.from(schema.fxRate)
			.where(
				and(
					eq(schema.fxRate.fromCurrency, from),
					eq(schema.fxRate.toCurrency, to),
					between(sql`CURRENT_DATE`, schema.fxRate.validFrom, schema.fxRate.validTo),
				),
			)
			.limit(1);

		if (!queryData[0]) return null;

		return queryData[0];
	}
}
