import { cn } from "@hoalu/ui/utils";

export interface PercentageChange {
	value: number;
	percentage: number;
	displayInValue: number;
	displayInPercent: string;
	currency: string;
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
			displayInValue: 0,
			displayInPercent: "0%",
			currency,
			status: "no-change",
		};
	}

	if (previousValue === 0) {
		return {
			value: currentValue,
			percentage: 100,
			displayInValue: currentValue,
			displayInPercent: currentValue > 0 ? "+100%" : "0%",
			currency,
			status: currentValue > 0 ? "increase" : "no-change",
		};
	}

	const value = currentValue - previousValue;
	const status = value === 0 ? "no-change" : value > 0 ? "increase" : "decrease";

	const percentageRaw = (value / previousValue) * 100;
	const percentage = Math.abs(percentageRaw);
	const displayInValue = status === "no-change" ? 0 : Math.abs(value);

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
		currency,
	};
}

export function getPercentageChangeTextClasses(change: PercentageChange) {
	return cn(
		change.status === "no-change" && "text-muted-foreground",
		change.status === "increase" && "text-red-600 dark:text-red-400",
		change.status === "decrease" && "text-green-600 dark:text-green-400",
	);
}
