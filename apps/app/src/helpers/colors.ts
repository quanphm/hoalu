import type { Color } from "@/lib/schema";
import { cn } from "@hoalu/ui/utils";

export function createCategoryTheme(color: Color) {
	const variants: Record<Color, string> = {
		red: cn(
			"bg-red-100 text-red-800 border-red-200",
			"dark:bg-red-950 dark:text-red-200 dark:border-red-700",
		),
		green: cn(
			"bg-green-100 text-green-800 border-green-200",
			"dark:bg-green-950 dark:text-green-200 dark:border-green-700",
		),
		teal: cn(
			"bg-teal-100 text-teal-800 border-teal-200",
			"dark:bg-teal-950 dark:text-teal-200 dark:border-teal-700",
		),
		blue: cn(
			"bg-blue-100 text-blue-800 border-blue-200",
			"dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700",
		),
		yellow: cn(
			"bg-yellow-100 text-yellow-800 border-yellow-200",
			"dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-700",
		),
		orange: cn(
			"bg-orange-100 text-orange-800 border-orange-200",
			"dark:bg-orange-950 dark:text-orange-200 dark:border-orange-700",
		),
		purple: cn(
			"bg-purple-100 text-purple-800 border-purple-200",
			"dark:bg-purple-950 dark:text-purple-200 dark:border-purple-700",
		),
		pink: cn(
			"bg-pink-100 text-pink-800 border-pink-200",
			"dark:bg-pink-950 dark:text-pink-200 dark:border-pink-700",
		),
		gray: cn(
			"bg-gray-100 text-gray-800 border-gray-200",
			"dark:bg-gray-950 dark:text-gray-200 dark:border-gray-700",
		),
		stone: cn(
			"bg-stone-100 text-stone-800 border-stone-200",
			"dark:bg-stone-950 dark:text-stone-200 dark:border-stone-700",
		),
	};

	return variants[color];
}
