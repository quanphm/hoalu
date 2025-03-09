export const PG_ENUM_COLOR = [
	"red",
	"green",
	"teal",
	"blue",
	"yellow",
	"orange",
	"purple",
	"pink",
	"gray",
	"stone",
] as const;

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
