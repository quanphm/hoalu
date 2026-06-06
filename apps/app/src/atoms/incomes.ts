import { observable } from "@legendapp/state";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";
import { syncObservable } from "@legendapp/state/sync";

import type { IncomeFormSchema } from "#app/lib/schema.ts";

type IncomeAtomSchema = IncomeFormSchema;
const basedIncome: IncomeAtomSchema = {
	title: "",
	description: "",
	date: new Date().toISOString(),
	transaction: {
		value: 0,
		currency: "",
	},
	walletId: "",
	categoryId: "",
};

export const draftIncome$ = observable<IncomeAtomSchema>(basedIncome);
syncObservable(draftIncome$, {
	persist: {
		name: "draft_income",
		plugin: ObservablePersistLocalStorage,
	},
});

export function resetDraftIncome() {
	draftIncome$.set(basedIncome);
}

export const selectedIncome$ = observable<{
	id: string | null;
}>({
	id: null,
});
