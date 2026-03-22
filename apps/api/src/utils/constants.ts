import type { ColorSchema } from "@hoalu/common/schema";

export const DEFAULT_EXPENSE_CATEGORIES: {
	name: string;
	description: string;
	color: ColorSchema;
}[] = [
	{
		name: "🍲 Food & Drink",
		color: "yellow",
		description: "Groceries, restaurants, cafes, and beverages",
	},
	{
		name: "📖 Education",
		color: "blue",
		description: "Courses, books, tuition, and learning materials",
	},
	{
		name: "🛒 Shopping",
		color: "green",
		description: "Retail purchases, clothing, and household items",
	},
	{
		name: "🎮 Entertainment",
		color: "purple",
		description: "Movies, games, concerts, and subscriptions",
	},
	{
		name: "💊 Healthcare",
		color: "red",
		description: "Medical expenses, prescriptions, and insurance",
	},
	{
		name: "🏠 Housing",
		color: "teal",
		description: "Rent, mortgage, utilities, and home maintenance",
	},
	{
		name: "🚗 Transportation",
		color: "stone",
		description: "Fuel, public transit, rideshares, and vehicle costs",
	},
	{
		name: "🎁 Gifts & Donations",
		color: "orange",
		description: "Presents, charitable giving, and contributions",
	},
	{
		name: "❓ Uncategorized",
		color: "gray",
		description: "Miscellaneous expenses pending classification",
	},
];

export const DEFAULT_INCOME_CATEGORIES: {
	name: string;
	description: string;
	color: ColorSchema;
}[] = [
	{
		name: "💼 Salary",
		color: "blue",
		description: "Income from employment or work",
	},
	{
		name: "🎉 Bonus",
		color: "purple",
		description: "Additional income from bonuses or commissions",
	},
	{
		name: "🏢 Business Revenue",
		color: "red",
		description: "Income from business operations or self-employment",
	},
	{
		name: "📊 Investments",
		color: "green",
		description: "Income from investment activities",
	},
	{
		name: "💰 Tax Refund",
		color: "yellow",
		description: "Income from tax refunds",
	},
];

export const WORKSPACE_CREATOR_ROLE = "owner";
