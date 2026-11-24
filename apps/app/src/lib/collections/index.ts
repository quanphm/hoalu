import { clearCategoryCollection } from "./category.ts";
import { clearEventCollection } from "./event.ts";
import { clearExchangeRateCollection } from "./exchange-rate.ts";
import { clearExpenseCollection } from "./expense.ts";
import { clearIncomeCollection } from "./income.ts";
import { clearRecurringBillCollection } from "./recurring-bill.ts";
import { clearWalletCollection } from "./wallet.ts";

export async function clearWorkspaceCollections(slug: string) {
	await Promise.all([
		clearExpenseCollection(slug),
		clearIncomeCollection(slug),
		clearCategoryCollection(slug),
		clearWalletCollection(slug),
		clearRecurringBillCollection(slug),
		clearEventCollection(slug),
		clearExchangeRateCollection(),
	]);
}

export async function clearAllWorkspaceCollections() {
	await Promise.all([
		clearExpenseCollection(),
		clearIncomeCollection(),
		clearCategoryCollection(),
		clearWalletCollection(),
		clearRecurringBillCollection(),
		clearEventCollection(),
		clearExchangeRateCollection(),
	]);
}

export * from "./category.ts";
export * from "./event.ts";
export * from "./exchange-rate.ts";
export * from "./expense.ts";
export * from "./income.ts";
export * from "./recurring-bill.ts";
export * from "./wallet.ts";
