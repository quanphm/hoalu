import { useId } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { useAppForm } from "#app/components/forms/index.tsx";
import {
	TransactionCloseAction,
	TransactionPageHeader,
} from "#app/components/transactions/transaction-layout.tsx";
import { WalletFields } from "#app/components/wallets/wallet-fields.tsx";
import {
	type WalletFormValues,
	toUpdateWalletPayload,
} from "#app/components/wallets/wallet-form.ts";
import { KEYBOARD_SHORTCUTS } from "#app/helpers/constants.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { WalletFormSchema } from "#app/lib/schema.ts";
import { useEditWallet } from "#app/services/mutations.ts";

import type { WalletSchema } from "#app/lib/schema.ts";
import type { ReactNode } from "react";

interface WalletEditFormProps {
	wallet: WalletSchema;
	headerActions?: ReactNode;
	onClose: () => void;
	/** What the wallet holds, rendered under the card it belongs to. */
	children?: ReactNode;
}

export function WalletEditForm({ wallet, headerActions, onClose, children }: WalletEditFormProps) {
	const workspace = useWorkspace();
	const mutation = useEditWallet();
	const formId = useId();

	const owners = workspace.members.map((member) => ({
		label: member.user.name,
		value: member.user.id,
	}));

	const form = useAppForm({
		defaultValues: {
			name: wallet.name,
			description: wallet.description ?? "",
			currency: wallet.currency,
			type: wallet.type,
			isActive: wallet.isActive,
			ownerId: wallet.owner.id,
		} as WalletFormValues,
		validators: { onSubmit: WalletFormSchema },
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({ id: wallet.id, payload: toUpdateWalletPayload(value) });
			form.reset(value);
		},
	});

	useHotkeys(
		KEYBOARD_SHORTCUTS.save_transaction.hotkey,
		(e) => {
			e.preventDefault();
			void form.handleSubmit();
		},
		{ enableOnFormTags: true },
		[form],
	);

	return (
		<form.AppForm>
			<TransactionPageHeader
				title={
					<form.Subscribe selector={(s) => s.values.name}>
						{(name) => name || "Untitled wallet"}
					</form.Subscribe>
				}
				actions={
					<>
						{headerActions}
						<TransactionCloseAction onClose={onClose} />
					</>
				}
			/>
			<WalletFields
				form={form}
				formId={formId}
				submitLabel="Update"
				showDirty
				owners={owners}
				showStatus
			/>
			{children}
		</form.AppForm>
	);
}
