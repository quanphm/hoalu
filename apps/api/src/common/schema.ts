import { type } from "arktype";

export const colorTupleSchema = type([
	"'red'",
	"'green'",
	"'blue'",
	"'cyan'",
	"'yellow'",
	"'amber'",
	"'orange'",
	"'purple'",
	"'fuchsia'",
	"'pink'",
	"'rose'",
	"'gray'",
	"'stone'",
	"'slate'",
	"'sky'",
]);
export type ColorTuple = typeof colorTupleSchema.inferOut;
export const colorSchema = type(
	"'red' | 'green' | 'blue' | 'cyan' | 'yellow' | 'amber' | 'orange' | 'purple' | 'fuchsia' | 'pink' | 'rose' | 'gray' | 'stone' | 'slate' | 'sky'",
);

export const taskStatusSchema = type("'todo' | 'in-progress' | 'done' | 'canceled' | 'blocked'");

export const prioritySchema = type("'urgent' | 'high' | 'medium' | 'low' | 'none'");

export const repeatSchema = type("'one-time' | 'weekly' | 'monthly' | 'yearly' | 'custom'");

export const walletTypeSchema = type(
	"'cash' | 'bank-account' | 'credit-card' |'debit-card' | 'digital-account'",
);
