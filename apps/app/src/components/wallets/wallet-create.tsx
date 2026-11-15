import { getRouteApi, useNavigate } from "@tanstack/react-router";
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
	toCreateWalletPayload,
} from "#app/components/wallets/wallet-form.ts";
import { KEYBOARD_SHORTCUTS } from "#app/helpers/constants.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { WalletFormSchema } from "#app/lib/schema.ts";
import { useCreateWallet } from "#app/services/mutations.ts";

const routeApi = getRouteApi("/_dashboard/$slug");

/** A wallet is a name plus three attributes, which is quick enough to deserve its own page. */
export function CreateWalletPage() {
	const workspace = useWorkspace();
	const { slug } = routeApi.useParams();
	const navigate = useNavigate();
	const mutation = useCreateWallet();
	const formId = useId();

	const form = useAppForm({
		defaultValues: {
			name: "",
			description: "",
			currency: workspace.metadata.currency,
			type: "cash",
		} as WalletFormValues,
		validators: { onSubmit: WalletFormSchema },
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({ payload: toCreateWalletPayload(value) });
			navigate({ to: "/$slug/wallets", params: { slug } });
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

	const handleClose = () => navigate({ to: "/$slug/wallets", params: { slug } });

	return (
		<form.AppForm>
			<TransactionPageHeader
				title={
					<form.Subscribe selector={(s) => s.values.name}>
						{(name) => name || "New wallet"}
					</form.Subscribe>
				}
				actions={<TransactionCloseAction onClose={handleClose} />}
			/>
			<WalletFields form={form} formId={formId} submitLabel="Create wallet" />
		</form.AppForm>
	);
}
