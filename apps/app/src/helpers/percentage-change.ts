export interface PercentageChange {
	percentage: number;
	isIncrease: boolean;
	isDecrease: boolean;
	isNoChange: boolean;
	displayValue: string;
}

/**
 * Calculate percentage change between current and previous values
 */
export function calculatePercentageChange(
	currentValue: number,
	previousValue: number,
): PercentageChange {
	if (previousValue === 0 && currentValue === 0) {
		return {
			percentage: 0,
			isIncrease: false,
			isDecrease: false,
			isNoChange: true,
			displayValue: "0%",
		};
	}

	if (previousValue === 0) {
		return {
			percentage: 100,
			isIncrease: currentValue > 0,
			isDecrease: false,
			isNoChange: currentValue === 0,
			displayValue: currentValue > 0 ? "+100%" : "0%",
		};
	}

	const percentage = ((currentValue - previousValue) / previousValue) * 100;
	const isIncrease = percentage > 0;
	const isDecrease = percentage < 0;
	const isNoChange = percentage === 0;

	const displayValue = isNoChange
		? "0%"
		: `${isIncrease ? "+" : ""}${Math.abs(percentage).toFixed(1)}%`;

	return {
		percentage: Math.abs(percentage),
		isIncrease,
		isDecrease,
		isNoChange,
		displayValue,
	};
}

export function getPercentageChangeClasses(change: PercentageChange) {
	if (change.isNoChange) {
		return "text-muted-foreground";
	}
	return change.isIncrease
		? "text-green-600 dark:text-green-400"
		: "text-red-600 dark:text-red-400";
}
