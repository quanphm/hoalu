import { cn } from "@hoalu/ui/utils";

import { formatCurrency } from "#app/helpers/currency.ts";

export interface PercentageChange {
	value: number;
	percentage: number;
	displayInValue: string;
	displayInPercent: string;
	status: "increase" | "decrease" | "no-change";
}

export function calculatePercentageChange(
	currentValue: number,
	previousValue: number,
	currency: string,
): PercentageChange {
	if (previousValue === 0 && currentValue === 0) {
		return {
			value: 0,
			percentage: 0,
			displayInValue: formatCurrency(0, currency),
			displayInPercent: "0%",
			status: "no-change",
		};
	}

	if (previousValue === 0) {
		return {
			value: currentValue,
			percentage: 100,
			displayInValue:
				currentValue > 0
					? `+${formatCurrency(currentValue, currency)}`
					: `${formatCurrency(currentValue, currency)}`,
			displayInPercent: currentValue > 0 ? "+100%" : "0%",
			status: currentValue > 0 ? "increase" : "no-change",
		};
	}

	const value = currentValue - previousValue;
	const status = value === 0 ? "no-change" : value > 0 ? "increase" : "decrease";

	const percentageRaw = (value / previousValue) * 100;
	const percentage = Math.abs(percentageRaw);

	const displayInValue =
		status === "no-change"
			? `${formatCurrency(0, currency)}`
			: `${status === "increase" ? "+" : "-"}${formatCurrency(Math.abs(value), currency)}`;

	const displayInPercent =
		status === "no-change"
			? "0%"
			: `${status === "increase" ? "+" : "-"}${Math.abs(percentageRaw).toFixed(1)}%`;

	return {
		status,
		value,
		percentage,
		displayInValue,
		displayInPercent,
	};
}

export function getPercentageChangeTextClasses(change: PercentageChange) {
	return cn(
		change.status === "no-change" && "text-muted-foreground",
		change.status === "increase" && "text-red-600 dark:text-red-400",
		change.status === "decrease" && "text-green-600 dark:text-green-400",
	);
}
