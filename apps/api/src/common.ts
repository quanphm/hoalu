import { type } from "arktype";

export const taskStatusSchema = type("'todo' | 'in-progress' | 'done' | 'canceled' | 'blocked'");
export type TaskType = typeof taskStatusSchema.inferOut;

export const prioritySchema = type("'urgent' | 'high' | 'medium' | 'low' | 'none'");
export type PriorityType = typeof prioritySchema.inferOut;

export const repeatSchema = type("'one-time' | 'weekly' | 'monthly' | 'yearly' | 'custom'");
export type RepeatType = typeof repeatSchema.inferOut;

export const colorSchema = type(
	"'red' | 'green' | 'blue' | 'cyan' | 'yellow' | 'orange' | 'purple' | 'fuchsia' | 'pink' | 'rose' | 'gray' | 'stone'",
);
export type Color = typeof colorSchema.inferOut;

export const walletTypeSchema = type(
	"'cash' | 'bank-account' | 'credit-card' |'debit-card' | 'digital-account'",
);
export type WalletType = typeof walletTypeSchema.inferOut;

export const DEFAULT_CATEGORIES: { name: string; color: Color }[] = [
	{
		name: "📖 Education",
		color: "blue",
	},
	{
		name: "🎮 Entertainment",
		color: "fuchsia",
	},
	{
		name: "🍽️ Food & Drink",
		color: "yellow",
	},
	{
		name: "💊 Healthcare",
		color: "green",
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
		color: "cyan",
	},
	{
		name: "🎁 Gifts & Donations",
		color: "red",
	},
	{
		name: "❔ Uncategorized",
		color: "stone",
	},
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MiB
