import { cn } from "@hoalu/ui/utils";
import type { ColorSchema, WalletTypeSchema } from "#app/lib/schema.ts";

export function createCategoryTheme(color: ColorSchema) {
	const variants: Record<ColorSchema, string> = {
		red: cn(
			"bg-red-200 text-red-900 border-red-500",
			"dark:bg-red-800 dark:border-red-500 dark:text-red-100",
			"data-[state=checked]:border-red-500 data-[state=checked]:bg-red-200 data-[state=checked]:text-red-900",
		),
		green: cn(
			"bg-green-200 text-green-900 border-green-500",
			"dark:bg-green-800 dark:border-green-500 dark:text-green-100",
			"data-[state=checked]:border-green-500 data-[state=checked]:bg-green-200 data-[state=checked]:text-green-900",
		),
		teal: cn(
			"bg-teal-200 text-teal-900 border-teal-500",
			"dark:bg-teal-800 dark:border-teal-500 dark:text-teal-100",
			"data-[state=checked]:border-teal-500 data-[state=checked]:bg-teal-200 data-[state=checked]:text-teal-900",
		),
		blue: cn(
			"bg-indigo-200 text-indigo-900 border-indigo-500",
			"dark:bg-indigo-800 dark:border-indigo-500 dark:text-indigo-100",
			"data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-200 data-[state=checked]:text-indigo-900",
		),
		yellow: cn(
			"bg-yellow-200 text-yellow-900 border-yellow-500",
			"dark:bg-yellow-800 dark:border-yellow-500 dark:text-yellow-100",
			"data-[state=checked]:border-yellow-500 data-[state=checked]:bg-yellow-200 data-[state=checked]:text-yellow-900",
		),
		orange: cn(
			"bg-orange-200 text-orange-900 border-orange-500",
			"dark:bg-orange-800 dark:border-orange-500 dark:text-orange-100",
			"data-[state=checked]:border-orange-500 data-[state=checked]:bg-orange-200 data-[state=checked]:text-orange-900",
		),
		purple: cn(
			"bg-purple-200 text-purple-800 border-purple-500",
			"dark:bg-purple-800 dark:border-purple-500 dark:text-purple-100",
			"data-[state=checked]:border-purple-500 data-[state=checked]:bg-purple-200 data-[state=checked]:text-purple-900",
		),
		pink: cn(
			"bg-pink-200 text-pink-900 border-pink-500",
			"dark:bg-pink-800 dark:border-pink-500 dark:text-pink-100",
			"data-[state=checked]:border-pink-500 data-[state=checked]:bg-pink-200 data-[state=checked]:text-pink-900",
		),
		gray: cn(
			"bg-gray-100 text-gray-900 border-gray-300",
			"dark:bg-gray-600 dark:border-gray-400 dark:text-gray-100",
			"data-[state=checked]:border-gray-300 data-[state=checked]:bg-gray-100 data-[state=checked]:text-gray-900",
		),
		stone: cn(
			"bg-stone-200 text-stone-900 border-stone-400",
			"dark:bg-stone-600 dark:border-stone-400 dark:text-stone-100",
			"data-[state=checked]:border-stone-400 data-[state=checked]:bg-stone-200 data-[state=checked]:text-stone-900",
		),
	};

	return cn(
		variants[color],
		"shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_1px_2px_0_rgba(0,0,0,0.08)]",
		"dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03),0_1px_2px_0_rgba(0,0,0,0.2)]",
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
