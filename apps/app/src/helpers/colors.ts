import type { Color } from "@/lib/schema";
import { cn } from "@hoalu/ui/utils";

export function createCategoryTheme(color: Color) {
	const variants = {
		red: cn(
			"bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
			"dark:bg-red-950 dark:text-red-200 dark:border-red-900 dark:hover:bg-red-900",
		),
		green: cn(
			"bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
			"dark:bg-green-950 dark:text-green-200 dark:border-green-900 dark:hover:bg-green-900",
		),
		blue: cn(
			"bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
			"dark:bg-blue-950 dark:text-blue-200 dark:border-blue-900 dark:hover:bg-blue-900",
		),
		sky: cn(
			"bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-200",
			"dark:bg-sky-950 dark:text-sky-200 dark:border-sky-900 dark:hover:bg-sky-900",
		),
		cyan: cn(
			"bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200",
			"dark:bg-cyan-950 dark:text-cyan-200 dark:border-cyan-900 dark:hover:bg-cyan-900",
		),
		yellow: cn(
			"bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
			"dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-900 dark:hover:bg-yellow-900",
		),
		amber: cn(
			"bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200",
			"dark:bg-amber-950 dark:text-amber-200 dark:border-amber-900 dark:hover:bg-amber-900",
		),
		orange: cn(
			"bg-lime-100 text-lime-800 border-lime-200 hover:bg-lime-200",
			"dark:bg-lime-950 dark:text-lime-200 dark:border-lime-900 dark:hover:bg-lime-900",
		),
		purple: cn(
			"bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
			"dark:bg-purple-950 dark:text-purple-200 dark:border-purple-900 dark:hover:bg-purple-900",
		),
		fuchsia: cn(
			"bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 hover:bg-fuchsia-200",
			"dark:bg-fuchsia-950 dark:text-fuchsia-200 dark:border-fuchsia-900 dark:hover:bg-fuchsia-900",
		),
		pink: cn(
			"bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200",
			"dark:bg-pink-950 dark:text-pink-200 dark:border-pink-900 dark:hover:bg-pink-900",
		),
		rose: cn(
			"bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200",
			"dark:bg-rose-950 dark:text-rose-200 dark:border-rose-900 dark:hover:bg-rose-900",
		),
		gray: cn(
			"bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
			"dark:bg-gray-950 dark:text-gray-200 dark:border-gray-900 dark:hover:bg-gray-900",
		),
		slate: cn(
			"bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200",
			"dark:bg-slate-950 dark:text-slate-200 dark:border-slate-900 dark:hover:bg-slate-900",
		),
		stone: cn(
			"bg-stone-100 text-stone-800 border-stone-200 hover:bg-stone-200",
			"dark:bg-stone-950 dark:text-stone-200 dark:border-stone-900 dark:hover:bg-stone-900",
		),
	} as const;

	return variants[color];
}
