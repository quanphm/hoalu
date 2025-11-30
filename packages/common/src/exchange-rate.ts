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

interface ExchangeRate {
	fromCurrency: string;
	toCurrency: string;
	exchangeRate: string;
	inverseRate: string;
}

interface ExchangeRateProvider {
	findDirect([from, to]: [string, string], date: string): Promise<ExchangeRate | null>;
	findCrossRate([from, to]: [string, string], date: string): Promise<ExchangeRate | null>;
}

interface SyncExchangeRateProvider {
	findDirect([from, to]: [string, string], date: string): ExchangeRate | null;
	findCrossRate([from, to]: [string, string], date: string): ExchangeRate | null;
}

// Async overload
function lookupExchangeRate(
	provider: ExchangeRateProvider,
	pair: [string, string],
	date?: string,
): Promise<ExchangeRate | null>;

// Sync overload
function lookupExchangeRate(
	provider: SyncExchangeRateProvider,
	pair: [string, string],
	date?: string,
): ExchangeRate | null;

// Implementation
function lookupExchangeRate(
	provider: ExchangeRateProvider | SyncExchangeRateProvider,
	[from, to]: [string, string],
	date?: string,
): Promise<ExchangeRate | null> | ExchangeRate | null {
	const lookupDate = date || new Date().toISOString();
	const strategy = getExchangeRateStrategy(from, to);

	/**
	 * Strategy 1: Same currency
	 * @example VND -> VND
	 */
	if (strategy === "same") {
		return {
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
		const result = provider.findCrossRate([from, to], lookupDate);
		if (result instanceof Promise) {
			return result.then((res) => (res ? res : null));
		}
		return result;
	}

	/**
	 * Strategy 3: Direct rate (USD → XXX or XXX → USD)
	 * @example XXX -> USD || USD -> XXX
	 */
	if (strategy === "direct") {
		const result = provider.findDirect([from, to], lookupDate);
		const useInverse = from !== "USD" && to === "USD";

		if (result instanceof Promise) {
			return result.then((res) => {
				if (!res) return null;
				return {
					...res,
					exchangeRate: useInverse ? res.inverseRate : res.exchangeRate,
					inverseRate: useInverse ? res.exchangeRate : res.inverseRate,
				};
			});
		}

		if (!result) return null;
		return {
			...result,
			exchangeRate: useInverse ? result.inverseRate : result.exchangeRate,
			inverseRate: useInverse ? result.exchangeRate : result.inverseRate,
		};
	}

	return null;
}

export { lookupExchangeRate, calculateCrossRate };
export type { ExchangeRate, ExchangeRateProvider, SyncExchangeRateProvider };
