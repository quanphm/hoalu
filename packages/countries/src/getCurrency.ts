import { currencies } from "./data/currencies";
import type { TCountryCode } from "./types";

export const getCurrency = (iso2: TCountryCode): string => {
	const currency = currencies[iso2];
	if (!currency) {
		throw new Error("Currency not found");
	}
	return currency;
};

export const getCurrencyList = (): string[] => {
	const uniqueSet = new Set(Object.values(currencies));
	return [...uniqueSet];
};
