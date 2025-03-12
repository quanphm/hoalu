import { getCurrencyList } from "@hoalu/countries";

export const TIME_IN_MILLISECONDS = {
	DEFAULT: 1,
	SECOND: 1000,
	MINUTE: 60_000,
	HOUR: 3_600_000,
	DAY: 86_400_000,
	WEEK: 604_800_000,
	YEAR: 31_536_000_000,
} as const;

export const TIME_IN_SECONDS = {
	DEFAULT: 1,
	SECOND: 1,
	MINUTE: 60,
	HOUR: 3_600,
	DAY: 86_400,
	WEEK: 604_800,
	YEAR: 31_536_000,
} as const;

export const AVAILABLE_CURRENCY_OPTIONS: {
	label: string;
	value: string;
}[] = getCurrencyList()
	.map((c) => ({
		label: c,
		value: c,
	}))
	.filter((c) => c.value === "USD" || c.value === "VND" || c.value === "SGD" || c.value === "EUR");
