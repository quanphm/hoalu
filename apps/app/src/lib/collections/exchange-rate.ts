import { CurrencySchema, IsoDateSchema } from "@hoalu/schema/schema";
import { persistedCollectionOptions } from "@tanstack/browser-db-sqlite-persistence";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import * as z from "zod";

import {
	getPersistence,
	INITIAL_RENDER,
	SCHEMA_VERSION,
} from "#app/lib/collections/persistence.ts";

const ExchangeRateCollectionSchema = z.object({
	from_currency: CurrencySchema,
	to_currency: CurrencySchema,
	exchange_rate: z.coerce.number(),
	inverse_rate: z.coerce.number(),
	valid_from: IsoDateSchema,
	valid_to: IsoDateSchema,
});

type ExchangeRateCollection = ReturnType<typeof buildExchangeRateCollection>;

function buildExchangeRateCollection() {
	const options = electricCollectionOptions({
		id: "exchange-rates",
		getKey: (item) => `${item.from_currency}-${item.to_currency}-${item.valid_from}`,
		shapeOptions: {
			url: `${import.meta.env.PUBLIC_API_URL}/sync/exchange-rates`,
		},
		schema: ExchangeRateCollectionSchema,
	});

	const persistence = getPersistence();
	if (!persistence) {
		return createCollection(options);
	}

	return createCollection(
		persistedCollectionOptions({
			...options,
			persistence,
			schemaVersion: SCHEMA_VERSION,
			initialRender: INITIAL_RENDER,
		}),
	);
}

let instance: ExchangeRateCollection | null = null;

export function exchangeRateCollectionFactory(): ExchangeRateCollection {
	instance ??= buildExchangeRateCollection();
	return instance;
}

export async function clearExchangeRateCollection() {
	if (!instance) return;
	const collection = instance;
	instance = null;
	await collection.cleanup({ dependents: true });
}
