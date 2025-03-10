import { zeroDecimalCurrencies } from "@hoalu/countries";

function toRealAmount(amount: number, unit: string): number {
	const isZeroDecimal = zeroDecimalCurrencies.find((c) => c === unit);
	if (isZeroDecimal) {
		return amount;
	}
	// use minor units - mostly cent
	return amount * 100;
}

function fromRealAmount(amount: string, unit: string): string {
	const isZeroDecimal = zeroDecimalCurrencies.find((c) => c === unit);
	if (isZeroDecimal) {
		return amount;
	}
	// use minor units - mostly cent
	return `${Number.parseFloat(amount) / 100}`;
}

export const monetary = {
	toRealAmount,
	fromRealAmount,
};
