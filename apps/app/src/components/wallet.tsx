import { createWalletDialogOpenAtom } from "@/atoms/dialogs";
import { useAppForm } from "@/components/forms";
import { HotKey } from "@/components/hotkey";
import { AVAILABLE_CURRENCY_OPTIONS, AVAILABLE_WALLET_TYPE_OPTIONS } from "@/helpers/constants";
import { useWorkspace } from "@/hooks/use-workspace";
import { type WalletFormSchema, walletFormSchema } from "@/lib/schema";
import { useCreateWallet } from "@/services/mutations";
import { Button } from "@hoalu/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@hoalu/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { useAtom, useSetAtom } from "jotai";

function CreateWalletDialog({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useAtom(createWalletDialogOpenAtom);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{children}
			<DialogContent
				className="sm:max-w-[480px]"
				onPointerDownOutside={(event) => {
					event.preventDefault();
				}}
				onCloseAutoFocus={(event) => {
					event.preventDefault();
				}}
			>
				<DialogHeader>
					<DialogTitle>Create new wallet</DialogTitle>
				</DialogHeader>
				<DialogDescription />
				<CreateWalletForm />
			</DialogContent>
		</Dialog>
	);
}

function CreateWalletDialogTrigger({ children }: { children: React.ReactNode }) {
	return (
		<Tooltip>
			<DialogTrigger asChild>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
			</DialogTrigger>
			<TooltipContent side="bottom">
				<HotKey>
					<span className="text-sm leading-none">Shift</span>W
				</HotKey>
			</TooltipContent>
		</Tooltip>
	);
}

function CreateWalletForm() {
	const {
		metadata: { currency: workspaceCurrency },
	} = useWorkspace();
	const setOpen = useSetAtom(createWalletDialogOpenAtom);
	const mutation = useCreateWallet();

	const form = useAppForm({
		defaultValues: {
			name: "",
			description: "",
			currency: workspaceCurrency,
			type: "cash",
		} as WalletFormSchema,
		validators: {
			onSubmit: walletFormSchema,
		},
		onSubmit: async ({ value }) => {
			const payload = {
				name: value.name,
				description: value.description,
				currency: value.currency,
				type: value.type,
			};
			await mutation.mutateAsync(payload);
			setOpen(false);
		},
	});

	console.log(form.state);

	return (
		<form.AppForm>
			<form.Form>
				<form.AppField name="name">
					{(field) => (
						<field.InputField label="Name" placeholder="My cash wallet" autoFocus required />
					)}
				</form.AppField>
				<form.AppField name="description">
					{(field) => <field.InputField placeholder="Physical wallet" label="Short description" />}
				</form.AppField>
				<div className="grid grid-cols-2 gap-4">
					<form.AppField name="type">
						{(field) => <field.SelectField label="Type" options={AVAILABLE_WALLET_TYPE_OPTIONS} />}
					</form.AppField>
					<form.AppField name="currency">
						{(field) => (
							<field.SelectField label="Default currency" options={AVAILABLE_CURRENCY_OPTIONS} />
						)}
					</form.AppField>
				</div>
				<Button type="submit" className="ml-auto w-fit">
					Create wallet
				</Button>
			</form.Form>
		</form.AppForm>
	);
}

export { CreateWalletDialog, CreateWalletDialogTrigger, CreateWalletForm };
