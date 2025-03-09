import type { ColorTuple } from "./schema";

export const PG_ENUM_COLOR = [
	"red",
	"green",
	"blue",
	"cyan",
	"yellow",
	"amber",
	"orange",
	"purple",
	"fuchsia",
	"pink",
	"rose",
	"gray",
	"stone",
	"slate",
	"sky",
] satisfies ColorTuple;

export const PG_ENUM_WALLET_TYPE = [
	"cash",
	"bank-account",
	"credit-card",
	"debit-card",
	"digital-account",
] as const;

export const PG_ENUM_PRIORITY = ["urgent", "high", "medium", "low", "none"] as const;

export const PG_ENUM_TASK_STATUS = ["todo", "in-progress", "done", "blocked", "canceled"] as const;

export const PG_ENUM_REPEAT = ["one-time", "weekly", "monthly", "yearly", "custom"] as const;
