import { clearCategoryCollection } from "./category.ts";
import { clearExchangeRateCollection } from "./exchange-rate.ts";
import { clearExpenseCollection } from "./expense.ts";
import { clearWalletCollection } from "./wallet.ts";

export function clearWorkspaceCollections(slug: string) {
	clearExpenseCollection(slug);
	clearCategoryCollection(slug);
	clearWalletCollection(slug);
	clearExchangeRateCollection();
}

export function clearAllWorkspaceCollections() {
	clearExpenseCollection();
	clearCategoryCollection();
	clearWalletCollection();
	clearExchangeRateCollection();
}

export * from "./category.ts";
export * from "./exchange-rate.ts";
export * from "./expense.ts";
export * from "./wallet.ts";
