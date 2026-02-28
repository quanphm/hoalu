import { clearCategoryCollection } from "./category.ts";
import { clearExchangeRateCollection } from "./exchange-rate.ts";
import { clearExpenseCollection } from "./expense.ts";
import { clearRecurringBillCollection } from "./recurring-bill.ts";
import { clearWalletCollection } from "./wallet.ts";

export function clearWorkspaceCollections(slug: string) {
	clearExpenseCollection(slug);
	clearCategoryCollection(slug);
	clearWalletCollection(slug);
	clearRecurringBillCollection(slug);
	clearExchangeRateCollection();
}

export function clearAllWorkspaceCollections() {
	clearExpenseCollection();
	clearCategoryCollection();
	clearWalletCollection();
	clearRecurringBillCollection();
	clearExchangeRateCollection();
}

export * from "./category.ts";
export * from "./exchange-rate.ts";
export * from "./expense.ts";
export * from "./recurring-bill.ts";
export * from "./wallet.ts";
