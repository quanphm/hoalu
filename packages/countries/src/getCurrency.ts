import { currencies } from "./data/currencies";
import type { TCountryCode } from "./types";

export const getCurrency = (iso2: TCountryCode): string => {
	if (!currencies[iso2]) {
		throw new Error("Currency not found");
	}
	return currencies[iso2];
};

export const getCurrencyList = (): string[] => {
	const uniqueSet = new Set(Object.values(currencies));
	return [...uniqueSet];
};
