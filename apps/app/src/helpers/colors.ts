import { cn } from "@hoalu/ui/utils";
import type { ColorSchema, WalletTypeSchema } from "@/lib/schema";

export function createCategoryTheme(color: ColorSchema) {
	const variants: Record<ColorSchema, string> = {
		red: cn(
			"bg-red-100 text-red-800 border-red-200 ",
			"dark:from-red-600/45 dark:to-red-600/30 dark:text-red-100",
			"data-[state=checked]:border-red-300 data-[state=checked]:bg-red-100 data-[state=checked]:text-red-300",
		),
		green: cn(
			"bg-green-100 text-green-800 border-green-200",
			"dark:from-green-600/45 dark:to-green-600/30 dark:text-green-100",
			"data-[state=checked]:border-green-300 data-[state=checked]:bg-green-100 data-[state=checked]:text-green-300",
		),
		teal: cn(
			"bg-teal-100 text-teal-800 border-teal-200",
			"dark:from-teal-600/45 dark:to-teal-600/30 dark:text-teal-100",
			"data-[state=checked]:border-teal-300 data-[state=checked]:bg-teal-100 data-[state=checked]:text-teal-300",
		),
		blue: cn(
			"bg-indigo-100 text-indigo-800 border-indigo-200",
			"dark:from-indigo-600/45 dark:to-indigo-600/30 dark:text-indigo-100",
			"data-[state=checked]:border-indigo-300 data-[state=checked]:bg-indigo-100 data-[state=checked]:text-indigo-300",
		),
		yellow: cn(
			"bg-yellow-100 text-yellow-800 border-yellow-200",
			"dark:from-yellow-600/45 dark:to-yellow-600/30 dark:text-yellow-100",
			"data-[state=checked]:border-yellow-300 data-[state=checked]:bg-yellow-100 data-[state=checked]:text-yellow-300",
		),
		orange: cn(
			"bg-orange-100 text-orange-800 border-orange-200",
			"dark:from-orange-600/45 dark:to-orange-600/30 dark:text-orange-100",
			"data-[state=checked]:border-orange-300 data-[state=checked]:bg-orange-100 data-[state=checked]:text-orange-300",
		),
		purple: cn(
			"bg-purple-100 text-purple-800 border-purple-200",
			"dark:from-purple-600/45 dark:to-purple-600/30 dark:text-purple-100",
			"data-[state=checked]:border-purple-300 data-[state=checked]:bg-purple-100 data-[state=checked]:text-purple-300",
		),
		pink: cn(
			"bg-pink-100 text-pink-800 border-pink-200",
			"dark:from-pink-600/45 dark:to-pink-600/30 dark:text-pink-100",
			"data-[state=checked]:border-pink-300 data-[state=checked]:bg-pink-100 data-[state=checked]:text-pink-300",
		),
		gray: cn(
			"bg-gray-100 text-gray-800 border-gray-200",
			"dark:from-gray-600/45 dark:to-gray-600/30 dark:text-gray-100",
			"data-[state=checked]:border-gray-300 data-[state=checked]:bg-gray-100 data-[state=checked]:text-gray-300",
		),
		stone: cn(
			"bg-stone-100 text-stone-800 border-stone-200",
			"dark:from-stone-600/45 dark:to-stone-600/30 dark:text-stone-100",
			"data-[state=checked]:border-stone-300 data-[state=checked]:bg-stone-100 data-[state=checked]:text-stone-300",
		),
	};

	return cn(
		variants[color],
		"dark:bg-gradient-to-b dark:shadow-[0_1px_2px_0_rgb(0_0_0/.05),inset_0_1px_0_0_rgb(255_255_255/.12)] dark:bg-transparent dark:border-transparent",
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

	return cn(variants[type]);
}
