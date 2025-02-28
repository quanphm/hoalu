import { type } from "arktype";

export const taskStatusSchema = type("'todo' | 'in-progress' | 'done' | 'canceled' | 'blocked'");
export const prioritySchema = type("'urgent' | 'high' | 'medium' | 'low' | 'none'");
export const colorSchema = type(
	"'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'pink' | 'brown'",
);
export type Color = typeof colorSchema.inferOut;
export const walletTypeSchema = type(
	"'cash' | 'bank-account' | 'credit-card' |'debit-card' | 'digital-account'",
);
export type WalletType = typeof walletTypeSchema.inferOut;

export const DEFAULT_CATEGORIES: { name: string; color: Color }[] = [
	{
		name: "📖 Education",
		color: "red",
	},
	{
		name: "🎮 Entertainment",
		color: "green",
	},
	{
		name: "🍲 Food & Drink",
		color: "blue",
	},
	{
		name: "💊 Healthcare",
		color: "yellow",
	},
	{
		name: "🏠 Housing",
		color: "purple",
	},
	{
		name: "🛒 Shopping",
		color: "pink",
	},
	{
		name: "🚗 Transporation",
		color: "brown",
	},
	{
		name: "🎁 Gifts & Donations",
		color: "red",
	},
	{
		name: "❔ Uncategorized",
		color: "yellow",
	},
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MiB
