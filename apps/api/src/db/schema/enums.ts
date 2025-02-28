import { pgEnum } from "drizzle-orm/pg-core";

export const colorTypeEnum = pgEnum("color_enum", [
	"red",
	"green",
	"blue",
	"yellow",
	"purple",
	"pink",
	"brown",
]);

export const walletTypeEnum = pgEnum("wallet_type_enum", [
	"cash",
	"bank-account",
	"credit-card",
	"debit-card",
	"digital-account",
]);

export const levelEnum = pgEnum("level_enum", ["urgent", "high", "medium", "low", "none"]);

export const taskStatusEnum = pgEnum("task_status", [
	"todo",
	"in-progress",
	"done",
	"blocked",
	"canceled",
]);
