import { observable } from "@legendapp/state";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";
import { syncObservable } from "@legendapp/state/sync";

export type AmountViewMode = "percent" | "value";

export const amountViewMode$ = observable<AmountViewMode>("percent");

syncObservable(amountViewMode$, {
	persist: {
		name: "amount_view_mode",
		plugin: ObservablePersistLocalStorage,
	},
});
