import { observable } from "@legendapp/state";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";
import { syncObservable } from "@legendapp/state/sync";

export const redactedAmount$ = observable(true);

syncObservable(redactedAmount$, {
	persist: {
		name: "redacted_amount",
		plugin: ObservablePersistLocalStorage,
	},
});
