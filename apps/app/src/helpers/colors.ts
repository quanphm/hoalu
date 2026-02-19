import type { ColorSchema, WalletTypeSchema } from "@hoalu/common/schema";
import { cn } from "@hoalu/ui/utils";

/**
 * Vibrant solid colors for charts and data visualization.
 * More saturated than badge themes for better visual distinction.
 */
export function createChartColor(color: ColorSchema) {
	const variants: Record<ColorSchema, string> = {
		red: "bg-red-500 dark:bg-red-400",
		green: "bg-emerald-500 dark:bg-emerald-400",
		teal: "bg-teal-500 dark:bg-teal-400",
		blue: "bg-blue-500 dark:bg-blue-400",
		yellow: "bg-amber-400 dark:bg-amber-300",
		orange: "bg-orange-500 dark:bg-orange-400",
		purple: "bg-violet-500 dark:bg-violet-400",
		pink: "bg-pink-500 dark:bg-pink-400",
		gray: "bg-slate-400 dark:bg-slate-500",
		stone: "bg-stone-400 dark:bg-stone-500",
	};

	return variants[color];
}

export function createCategoryTheme(color: ColorSchema) {
	const variants: Record<ColorSchema, string> = {
		red: cn(
			"border-red-300 bg-red-100 text-red-800",
			"dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300",
			"data-[state=checked]:border-red-500 data-[state=checked]:bg-red-200 data-[state=checked]:text-red-900",
		),
		green: cn(
			"border-green-300 bg-green-100 text-green-800",
			"dark:border-green-500/30 dark:bg-green-500/15 dark:text-green-300",
			"data-[state=checked]:border-green-500 data-[state=checked]:bg-green-200 data-[state=checked]:text-green-900",
		),
		teal: cn(
			"border-teal-300 bg-teal-100 text-teal-800",
			"dark:border-teal-500/30 dark:bg-teal-500/15 dark:text-teal-300",
			"data-[state=checked]:border-teal-500 data-[state=checked]:bg-teal-200 data-[state=checked]:text-teal-900",
		),
		blue: cn(
			"border-indigo-300 bg-indigo-100 text-indigo-800",
			"dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-300",
			"data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-200 data-[state=checked]:text-indigo-900",
		),
		yellow: cn(
			"border-yellow-300 bg-yellow-100 text-yellow-800",
			"dark:border-yellow-500/30 dark:bg-yellow-500/15 dark:text-yellow-300",
			"data-[state=checked]:border-yellow-500 data-[state=checked]:bg-yellow-200 data-[state=checked]:text-yellow-900",
		),
		orange: cn(
			"border-orange-300 bg-orange-100 text-orange-800",
			"dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-300",
			"data-[state=checked]:border-orange-500 data-[state=checked]:bg-orange-200 data-[state=checked]:text-orange-900",
		),
		purple: cn(
			"border-purple-300 bg-purple-100 text-purple-800",
			"dark:border-purple-500/30 dark:bg-purple-500/15 dark:text-purple-300",
			"data-[state=checked]:border-purple-500 data-[state=checked]:bg-purple-200 data-[state=checked]:text-purple-900",
		),
		pink: cn(
			"border-pink-300 bg-pink-100 text-pink-800",
			"dark:border-pink-500/30 dark:bg-pink-500/15 dark:text-pink-300",
			"data-[state=checked]:border-pink-500 data-[state=checked]:bg-pink-200 data-[state=checked]:text-pink-900",
		),
		gray: cn(
			"border-gray-300 bg-gray-100 text-gray-700",
			"dark:border-gray-500/30 dark:bg-gray-500/15 dark:text-gray-300",
			"data-[state=checked]:border-gray-400 data-[state=checked]:bg-gray-200 data-[state=checked]:text-gray-900",
		),
		stone: cn(
			"border-stone-300 bg-stone-100 text-stone-700",
			"dark:border-stone-500/30 dark:bg-stone-500/15 dark:text-stone-300",
			"data-[state=checked]:border-stone-400 data-[state=checked]:bg-stone-200 data-[state=checked]:text-stone-900",
		),
	};

	return cn(
		variants[color],
		"shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)]",
		"dark:shadow-none",
	);
}

export function createWalletTheme(type: WalletTypeSchema) {
	const variants: Record<WalletTypeSchema, string> = {
		"bank-account": "text-blue-500 bg-blue-500",
		cash: "text-yellow-500 bg-yellow-500",
		"credit-card": "text-lime-500 bg-lime-500",
		"debit-card": "text-violet-500 bg-violet-500",
		"digital-account": "text-orange-500 bg-orange-500",
	};

	return variants[type];
}
