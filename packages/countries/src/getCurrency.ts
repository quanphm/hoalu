import { countries } from "./data/countries";
import type { ICountryData, TCountryCode } from "./types";

export const getCurrency = (iso2: TCountryCode): string[] => {
	if (!countries[iso2]) {
		throw new Error("Country not found");
	}
	return countries[iso2].currency;
};

export const getCurrencyList = (): string[] => {
	const currencies = (Object.keys(countries) as TCountryCode[]).map(
		(iso2) => new Set(getCurrency(iso2)),
	);
	console.log(currencies);

	let uniqueSet = new Set<string>();
	for (const dataSet of currencies) {
		uniqueSet = uniqueSet.union(dataSet);
	}

	return Array.from(uniqueSet);
};
