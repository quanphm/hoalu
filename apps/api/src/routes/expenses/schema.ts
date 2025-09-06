import { type } from "arktype";

import { monetary } from "../../common/monetary";
import {
	ColorSchema,
	CurrencySchema,
	IsoDateSchema,
	RepeatSchema,
	WalletTypeSchema,
} from "../../common/schema";

export const ExpenseSchema = type({
	"+": "delete",
	id: "string.uuid.v7",
	title: "string",
	description: "string | null",
	amount: "string.numeric.parse",
	realAmount: "string.numeric.parse",
	currency: "string",
	repeat: RepeatSchema,
	date: IsoDateSchema,
	creator: {
		"+": "delete",
		id: "string.uuid.v7",
		publicId: "string",
		name: "string",
		email: "string.email",
		image: "string | null",
	},
	wallet: {
		"+": "delete",
		id: "string.uuid.v7",
		name: "string",
		description: "string | null",
		currency: "string",
		type: WalletTypeSchema,
		isActive: "boolean",
	},
	category: type({
		"+": "delete",
		id: "string.uuid.v7",
		name: "string",
		description: "string | null",
		color: ColorSchema,
	}).or("null"),
	createdAt: IsoDateSchema,
}).pipe((e) => ({
	...e,
	amount: monetary.fromRealAmount(e.amount, e.currency),
}));
export const ExpensesSchema = ExpenseSchema.array().onUndeclaredKey("delete");

export const InsertExpenseSchema = type({
	title: "string > 0",
	"description?": "string",
	amount: "number",
	currency: CurrencySchema,
	repeat: RepeatSchema.default("one-time"),
	"date?": "string.date.iso",
	walletId: "string.uuid.v7",
	categoryId: "string.uuid.v7",
});

export const UpdateExpenseSchema = InsertExpenseSchema.partial();

export const DeleteExpenseSchema = type({
	id: "string.uuid.v7",
});
