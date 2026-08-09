import { observable } from "@legendapp/state";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";
import { syncObservable } from "@legendapp/state/sync";

import type { IncomeFormSchema } from "#app/lib/schema.ts";

type IncomeAtomSchema = IncomeFormSchema;

export const makeDraftIncome = (): IncomeAtomSchema => ({
	title: "",
	description: "",
	// Empty date means "no explicit date picked" — the create form falls back to "now".
	// Storing a concrete timestamp here would go stale in the persisted draft.
	date: "",
	transaction: {
		value: 0,
		currency: "",
	},
	walletId: "",
	categoryId: "",
});

export const draftIncome$ = observable<IncomeAtomSchema>(makeDraftIncome());
syncObservable(draftIncome$, {
	persist: {
		name: "draft_income",
		plugin: ObservablePersistLocalStorage,
	},
});

export const selectedIncome$ = observable<{
	id: string | null;
}>({
	id: null,
});
