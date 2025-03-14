import type { Color } from "@/lib/schema";
import { cn } from "@hoalu/ui/utils";

export function createCategoryTheme(color: Color) {
	const variants: Record<Color, string> = {
		red: cn(
			"bg-red-100 text-red-800 border-red-200 ",
			"dark:from-red-800/45 dark:to-red-800/30 dark:text-red-200",
			"data-[state=checked]:border-red-300 data-[state=checked]:bg-red-100 data-[state=checked]:text-red-300",
		),
		green: cn(
			"bg-green-100 text-green-800 border-green-200",
			"dark:from-green-800/45 dark:to-green-800/30 dark:text-green-200",
			"data-[state=checked]:border-green-300 data-[state=checked]:bg-green-100 data-[state=checked]:text-green-300",
		),
		teal: cn(
			"bg-teal-100 text-teal-800 border-teal-200",
			"dark:from-teal-800/45 dark:to-teal-800/30 dark:text-teal-200",
			"data-[state=checked]:border-teal-300 data-[state=checked]:bg-teal-100 data-[state=checked]:text-teal-300",
		),
		blue: cn(
			"bg-indigo-100 text-indigo-800 border-indigo-200",
			"dark:from-indigo-800/45 dark:to-indigo-800/30 dark:text-indigo-200",
			"data-[state=checked]:border-indigo-200 data-[state=checked]:bg-indigo-100",
			"data-[state=checked]:border-indigo-300 data-[state=checked]:bg-indigo-100 data-[state=checked]:text-indigo-300",
		),
		yellow: cn(
			"bg-yellow-100 text-yellow-800 border-yellow-200",
			"dark:from-yellow-800/45 dark:to-yellow-800/30 dark:text-yellow-200",
			"data-[state=checked]:border-yellow-300 data-[state=checked]:bg-yellow-100 data-[state=checked]:text-yellow-300",
		),
		orange: cn(
			"bg-orange-100 text-orange-800 border-orange-200",
			"dark:from-orange-800/45 dark:to-orange-800/30 dark:text-orange-200",
			"data-[state=checked]:border-orange-300 data-[state=checked]:bg-orange-100 data-[state=checked]:text-orange-300",
		),
		purple: cn(
			"bg-purple-100 text-purple-800 border-purple-200",
			"dark:from-purple-800/45 dark:to-purple-800/30 dark:text-purple-200",
			"data-[state=checked]:border-purple-300 data-[state=checked]:bg-purple-100 data-[state=checked]:text-purple-300",
		),
		pink: cn(
			"bg-pink-100 text-pink-800 border-pink-200",
			"dark:from-pink-800/45 dark:to-pink-800/30 dark:text-pink-200",
			"data-[state=checked]:border-pink-300 data-[state=checked]:bg-pink-100 data-[state=checked]:text-pink-300",
		),
		gray: cn(
			"bg-gray-100 text-gray-800 border-gray-200",
			"dark:from-gray-800/45 dark:to-gray-800/30 dark:text-gray-200",
			"data-[state=checked]:border-gray-300 data-[state=checked]:bg-gray-100 data-[state=checked]:text-gray-300",
		),
		stone: cn(
			"bg-stone-100 text-stone-800 border-stone-200",
			"dark:from-stone-800/45 dark:to-stone-800/30 dark:text-stone-200",
			"data-[state=checked]:border-stone-300 data-[state=checked]:bg-stone-100 data-[state=checked]:text-stone-300",
		),
	};

	return cn(
		variants[color],
		"dark:bg-gradient-to-b dark:shadow-[0_1px_2px_0_rgb(0_0_0/.05),inset_0_1px_0_0_rgb(255_255_255/.12)] dark:bg-transparent dark:border-transparent",
	);
}
