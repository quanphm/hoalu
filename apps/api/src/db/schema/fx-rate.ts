import { date, numeric, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";

export const fxRate = pgTable(
	"fx_rate",
	{
		fromCurrency: varchar("from_currency", { length: 3 }).notNull(),
		toCurrency: varchar("to_currency", { length: 3 }).notNull(),
		exchangeRate: numeric("exchange_rate", { precision: 18, scale: 6 }).notNull(),
		inverseRate: numeric("inverse_rate", { precision: 18, scale: 6 }).notNull(),
		validFrom: date("valid_from").defaultNow().notNull(),
		validTo: date("valid_to").defaultNow().notNull(),
	},
	(table) => [
		primaryKey({
			columns: [table.fromCurrency, table.toCurrency, table.exchangeRate, table.validFrom],
		}),
	],
);
