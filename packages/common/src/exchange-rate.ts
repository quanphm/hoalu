import { datetime } from "./datetime.ts";

interface ExchangeRate {
	date: string;
	fromCurrency: string;
	toCurrency: string;
	exchangeRate: string;
	inverseRate: string;
}

interface ExchangeRateProvider {
	findDirect([from, to]: [string, string], date?: string): Promise<ExchangeRate | null>;
	findCrossRate([from, to]: [string, string], date?: string): Promise<ExchangeRate | null>;
}

function calculateCrossRate(params: {
	pair: [string, string];
	usdToFrom?: { exchangeRate: string; inverseRate: string };
	usdToTo?: { exchangeRate: string; inverseRate: string };
}) {
	const { usdToFrom, usdToTo } = params;

	if (!usdToFrom || !usdToTo) return null;

	// Cross-rate formula: FROM → TO = (USD → FROM)^-1 × (USD → TO)
	const exchangeRate =
		Number.parseFloat(usdToFrom.inverseRate) * Number.parseFloat(usdToTo.exchangeRate);
	const inverseRate =
		Number.parseFloat(usdToTo.inverseRate) * Number.parseFloat(usdToFrom.exchangeRate);

	return {
		fromCurrency: params.pair[0],
		toCurrency: params.pair[1],
		exchangeRate: exchangeRate.toString(),
		inverseRate: inverseRate.toString(),
	};
}

function getExchangeRateStrategy(from: string, to: string) {
	if (from === to) {
		return "same" as const;
	}
	if (from !== "USD" && to !== "USD") {
		return "cross" as const;
	}
	return "direct" as const;
}

async function lookupExchangeRate(
	provider: ExchangeRateProvider,
	[from, to]: [string, string],
	date?: string,
): Promise<ExchangeRate | null> {
	const today = new Date().toISOString();
	const returnedDate = datetime.format(date || today, "yyyy-MM-dd");

	const strategy = getExchangeRateStrategy(from, to);

	/**
	 * Strategy 1: Same currency
	 * @example VND -> VND
	 */
	if (strategy === "same") {
		return {
			date: returnedDate,
			fromCurrency: from,
			toCurrency: to,
			exchangeRate: "1",
			inverseRate: "1",
		};
	}

	/**
	 * Strategy 2: Cross-rate (VND → SGD via USD)
	 * @example VND -> USD -> SGD || SGD -> USD -> VND
	 */
	if (strategy === "cross") {
		const result = await provider.findCrossRate([from, to], date);
		if (!result) return null;
		return {
			...result,
			date: returnedDate,
		};
	}

	/**
	 * Strategy 3: Direct rate (USD → XXX or XXX → USD)
	 * @example XXX -> USD || USD -> XXX
	 */
	if (strategy === "direct") {
		const result = await provider.findDirect([from, to], date);
		const useInverse = from !== "USD" && to === "USD";
		if (!result) return null;
		return {
			...result,
			date: returnedDate,
			exchangeRate: useInverse ? result.inverseRate : result.exchangeRate,
			inverseRate: useInverse ? result.exchangeRate : result.inverseRate,
		};
	}

	return null;
}

export { lookupExchangeRate, calculateCrossRate };
export type { ExchangeRate, ExchangeRateProvider };
