import type { WalletFormSchema } from "#app/lib/schema.ts";
import type { WalletPatchSchema } from "#app/lib/schema.ts";

/** The form carries the owner, which only the edit page exposes. */
export type WalletFormValues = WalletFormSchema & { ownerId?: string };

export function toCreateWalletPayload(value: WalletFormValues) {
	return {
		name: value.name,
		description: value.description,
		currency: value.currency,
		type: value.type,
	};
}

export function toUpdateWalletPayload(value: WalletFormValues): WalletPatchSchema {
	return {
		name: value.name,
		description: value.description,
		currency: value.currency,
		type: value.type,
		isActive: value.isActive ?? true,
		ownerId: value.ownerId ?? "",
	};
}
