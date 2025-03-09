import { type } from "arktype";

export const taskStatusSchema = type("'todo' | 'in-progress' | 'done' | 'canceled' | 'blocked'");
export type TaskType = typeof taskStatusSchema.inferOut;

export const prioritySchema = type("'urgent' | 'high' | 'medium' | 'low' | 'none'");
export type PriorityType = typeof prioritySchema.inferOut;

export const repeatSchema = type("'one-time' | 'weekly' | 'monthly' | 'yearly' | 'custom'");
export type RepeatType = typeof repeatSchema.inferOut;

export const colorSchema = type(
	"'red' | 'green' | 'blue' | 'cyan' | 'yellow' | 'amber' | 'orange' | 'purple' | 'fuchsia' | 'pink' | 'rose' | 'gray' | 'stone' | 'slate' | 'sky'",
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

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MiB
