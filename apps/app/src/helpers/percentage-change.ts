import { cn } from "@hoalu/ui/utils";
import { formatCurrency } from "@/helpers/currency";

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
	const percentage = Math.abs(((currentValue - previousValue) / previousValue) * 100);
	const status = percentage === 0 ? "no-change" : percentage > 0 ? "increase" : "decrease";

	const displayInValue =
		status === "no-change"
			? `${formatCurrency(0, currency)}`
			: `${status === "increase" ? "+" : "-"}${formatCurrency(value, currency)}`;
	const displayInPercent =
		status === "no-change" ? "0%" : `${status === "increase" ? "+" : "-"}${percentage.toFixed(1)}%`;

	return {
		value,
		percentage,
		displayInValue,
		displayInPercent,
		status,
	};
}

export function getPercentageChangeTextClasses(change: PercentageChange) {
	return cn(
		change.status === "no-change" && "text-muted-foreground",
		change.status === "increase" && "text-green-600 dark:text-green-400",
		change.status === "decrease" && "text-red-600 dark:text-red-400",
	);
}
