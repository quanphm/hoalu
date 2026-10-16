import { cn } from "@hoalu/ui/utils";

import type { ColorSchema, WalletTypeSchema } from "@hoalu/schema/schema";

/**
 * Category, wallet and chart colours, drawn from the OC-2 ramps only.
 *
 * There are ten `ColorSchema` values and nine usable OC-2 hues, so two names
 * share a family: `teal` reads as `cyan`, and `stone` (a warm grey, which OC-2
 * does not have) reads as the deep end of `yellow` — a khaki or sand rather than
 * the vivid gold of the `yellow` chip, and clearly distinct from `orange`. It is
 * the one visible compromise in this mapping.
 *
 * Class strings are written out in full rather than assembled from a hue name:
 * Tailwind scans for literal utilities, so anything built at runtime would never
 * be generated. Values that are not classes — the chart fills below — are plain
 * `var()` strings and can be built dynamically.
 */

/** Rest and checked states of a category chip, as a three-step state triad. */
const CHIP: Record<ColorSchema, string> = {
	red: cn(
		"border-(--oc2-red-900) bg-(--oc2-red-1200) text-(--oc2-red-500)",
		"data-[state=checked]:border-(--oc2-red-500) data-[state=checked]:bg-(--oc2-red-900) data-[state=checked]:text-(--oc2-red-300)",
	),
	green: cn(
		"border-(--oc2-green-900) bg-(--oc2-green-1200) text-(--oc2-green-500)",
		"data-[state=checked]:border-(--oc2-green-500) data-[state=checked]:bg-(--oc2-green-900) data-[state=checked]:text-(--oc2-green-300)",
	),
	teal: cn(
		"border-(--oc2-cyan-900) bg-(--oc2-cyan-1200) text-(--oc2-cyan-400)",
		"data-[state=checked]:border-(--oc2-cyan-400) data-[state=checked]:bg-(--oc2-cyan-900) data-[state=checked]:text-(--oc2-cyan-300)",
	),
	blue: cn(
		"border-(--oc2-blue-900) bg-(--oc2-blue-1200) text-(--oc2-blue-400)",
		"data-[state=checked]:border-(--oc2-blue-500) data-[state=checked]:bg-(--oc2-blue-900) data-[state=checked]:text-(--oc2-blue-300)",
	),
	yellow: cn(
		"border-(--oc2-yellow-900) bg-(--oc2-yellow-1200) text-(--oc2-yellow-500)",
		"data-[state=checked]:border-(--oc2-yellow-500) data-[state=checked]:bg-(--oc2-yellow-900) data-[state=checked]:text-(--oc2-yellow-300)",
	),
	orange: cn(
		"border-(--oc2-orange-900) bg-(--oc2-orange-1200) text-(--oc2-orange-500)",
		"data-[state=checked]:border-(--oc2-orange-500) data-[state=checked]:bg-(--oc2-orange-900) data-[state=checked]:text-(--oc2-orange-300)",
	),
	purple: cn(
		"border-(--oc2-purple-900) bg-(--oc2-purple-1200) text-(--oc2-purple-400)",
		"data-[state=checked]:border-(--oc2-purple-500) data-[state=checked]:bg-(--oc2-purple-900) data-[state=checked]:text-(--oc2-purple-300)",
	),
	pink: cn(
		"border-(--oc2-pink-900) bg-(--oc2-pink-1200) text-(--oc2-pink-400)",
		"data-[state=checked]:border-(--oc2-pink-500) data-[state=checked]:bg-(--oc2-pink-900) data-[state=checked]:text-(--oc2-pink-300)",
	),
	gray: cn(
		"border-(--oc2-grey-800) bg-(--oc2-grey-1000) text-(--oc2-grey-400)",
		"data-[state=checked]:border-(--oc2-grey-500) data-[state=checked]:bg-(--oc2-grey-800) data-[state=checked]:text-(--oc2-grey-200)",
	),
	stone: cn(
		"border-(--oc2-yellow-900) bg-(--oc2-yellow-1100) text-(--oc2-yellow-200)",
		"data-[state=checked]:border-(--oc2-yellow-700) data-[state=checked]:bg-(--oc2-yellow-900) data-[state=checked]:text-(--oc2-yellow-100)",
	),
};

/** The fill step per hue. One source of truth: the swatches and the chart
 *  segments read from this, so a legend dot cannot drift from its slice. */
const FILL_VAR: Record<ColorSchema, string> = {
	red: "--oc2-red-500",
	green: "--oc2-green-500",
	teal: "--oc2-cyan-400",
	blue: "--oc2-blue-400",
	yellow: "--oc2-yellow-500",
	orange: "--oc2-orange-500",
	purple: "--oc2-purple-400",
	pink: "--oc2-pink-400",
	gray: "--oc2-grey-500",
	stone: "--oc2-yellow-200",
};

/** A raw colour for swatches and chart `fill`/`stroke` props — not a class. */
export function createChartColor(color: ColorSchema) {
	return `var(${FILL_VAR[color]})`;
}

/** The `-500`/`-400` text and fill pair used by wallet badges. */
/** The `-500`/`-400` text and fill pair used by wallet badges. */
const WALLET: Record<WalletTypeSchema, string> = {
	"bank-account": "text-(--oc2-blue-400) bg-(--oc2-blue-400)",
	cash: "text-(--oc2-yellow-500) bg-(--oc2-yellow-500)",
	"credit-card": "text-(--oc2-green-500) bg-(--oc2-green-500)",
	"debit-card": "text-(--oc2-purple-400) bg-(--oc2-purple-400)",
	"digital-account": "text-(--oc2-orange-500) bg-(--oc2-orange-500)",
};

export function createChartColorTheme(color: ColorSchema) {
	const fill = createChartColor(color);
	// Both keys carry the same value: there is no light mode, and the chart
	// component's config type requires the pair.
	return { light: fill, dark: fill };
}

export function createCategoryTheme(color: ColorSchema | undefined) {
	if (!color) {
		return cn(
			"text-2xs! border-(--oc2-grey-800) bg-(--oc2-grey-1000) text-(--oc2-grey-400)",
			"data-[state=checked]:border-(--oc2-grey-500) data-[state=checked]:bg-(--oc2-grey-800) data-[state=checked]:text-(--oc2-grey-200)",
		);
	}
	return cn(CHIP[color], "text-2xs!");
}

export function createWalletTheme(type: WalletTypeSchema) {
	return WALLET[type];
}
