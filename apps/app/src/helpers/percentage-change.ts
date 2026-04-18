import { cva } from "class-variance-authority";

const percentFormatter = new Intl.NumberFormat("en-US", {
	style: "percent",
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

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

	const percentageRaw = value / previousValue;
	const percentage = Math.abs(percentageRaw);
	const displayInValue = status === "no-change" ? 0 : Math.abs(value);

	const displayInPercent =
		status === "no-change"
			? "0%"
			: `${status === "increase" ? "+" : "-"}${percentFormatter.format(percentage)}`;

	return {
		status,
		value,
		percentage,
		displayInValue,
		displayInPercent,
		currency,
	};
}

export const trendChangeVariants = cva(["bg-transparent"], {
	variants: {
		trend: {
			"no-change": "text-muted-foreground",
			increase: "",
			decrease: "",
		},
		background: {
			true: null,
			false: null,
		},
		invert: {
			true: null,
			false: null,
		},
	},
	compoundVariants: [
		// increase
		{
			trend: "increase",
			background: false,
			invert: false,
			class: "text-green-600 dark:text-green-400",
		},
		{
			trend: "increase",
			background: false,
			invert: true,
			class: "text-red-600 dark:text-red-400",
		},
		{
			trend: "increase",
			background: true,
			invert: false,
			class: "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400",
		},
		{
			trend: "increase",
			background: true,
			invert: true,
			class: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
		},
		// decrease
		{
			trend: "decrease",
			background: false,
			invert: false,
			class: "text-red-600 dark:text-red-400",
		},
		{
			trend: "decrease",
			background: false,
			invert: true,
			class: "text-green-600 dark:text-green-400",
		},
		{
			trend: "decrease",
			background: true,
			invert: false,
			class: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
		},
		{
			trend: "decrease",
			background: true,
			invert: true,
			class: "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400",
		},
	],
	defaultVariants: {
		trend: "no-change",
		background: false,
		invert: false,
	},
});
