import { cn } from "@hoalu/ui/utils";

export interface PercentageChange {
	percentage: number;
	displayValue: string;
	status: "increase" | "decrease" | "no-change";
}

export function calculatePercentageChange(
	currentValue: number,
	previousValue: number,
): PercentageChange {
	if (previousValue === 0 && currentValue === 0) {
		return {
			percentage: 0,
			displayValue: "0%",
			status: "no-change",
		};
	}

	if (previousValue === 0) {
		return {
			percentage: 100,
			displayValue: currentValue > 0 ? "+100%" : "0%",
			status: currentValue > 0 ? "increase" : "no-change",
		};
	}

	const percentage = ((currentValue - previousValue) / previousValue) * 100;
	const status = percentage === 0 ? "no-change" : percentage > 0 ? "increase" : "decrease";

	const displayValue =
		status === "no-change"
			? "0%"
			: `${status === "increase" ? "+" : "-"}${Math.abs(percentage).toFixed(1)}%`;

	return {
		percentage: Math.abs(percentage),
		displayValue,
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
