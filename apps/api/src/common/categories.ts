import type { ColorTuple } from "./schema";

export const DEFAULT_CATEGORIES: { name: string; color: ColorTuple[number] }[] = [
	{
		name: "📖 Education",
		color: "blue",
	},
	{
		name: "🎮 Entertainment",
		color: "purple",
	},
	{
		name: "🍲 Food & Drink",
		color: "orange",
	},
	{
		name: "💊 Healthcare",
		color: "red",
	},
	{
		name: "🏠 Housing",
		color: "slate",
	},
	{
		name: "🛒 Shopping",
		color: "green",
	},
	{
		name: "🚗 Transporation",
		color: "sky",
	},
	{
		name: "🎁 Gifts & Donations",
		color: "yellow",
	},
	{
		name: "❓ Uncategorized",
		color: "gray",
	},
];
