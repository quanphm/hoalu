import { createWalletDialogOpenAtom } from "@/atoms/dialogs";
import { useAppForm } from "@/components/forms";
import { HotKeyWithTooltip } from "@/components/hotkey";
import { WarningMessage } from "@/components/warning-message";
import {
	AVAILABLE_CURRENCY_OPTIONS,
	AVAILABLE_WALLET_TYPE_OPTIONS,
	KEYBOARD_SHORTCUTS,
} from "@/helpers/constants";
import { useWorkspace } from "@/hooks/use-workspace";
import { type WalletFormSchema, walletFormSchema } from "@/lib/schema";
import { useCreateWallet, useDeleteWallet } from "@/services/mutations";
import { MoreHorizontalIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@hoalu/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@hoalu/ui/dropdown-menu";
import { useAtom, useSetAtom } from "jotai";
import { useState } from "react";

function CreateWalletDialog({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useAtom(createWalletDialogOpenAtom);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{children}
			<DialogContent
				className="sm:max-w-[480px]"
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
	const setOpen = useSetAtom(createWalletDialogOpenAtom);

	return (
		<HotKeyWithTooltip
			onClick={() => setOpen(true)}
			shortcut={KEYBOARD_SHORTCUTS.create_wallet.label}
		>
			{children}
		</HotKeyWithTooltip>
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

function EditWalletForm() {
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

function EditWalletDialogContent() {
	return (
		<DialogContent className="sm:max-w-[480px]">
			<DialogHeader>
				<DialogTitle>Edit wallet</DialogTitle>
				<DialogDescription />
				<EditWalletForm />
			</DialogHeader>
		</DialogContent>
	);
}

function DeleteWalletDialogContent({ onDelete }: { onDelete(): void }) {
	return (
		<DialogContent className="sm:max-w-[480px]">
			<DialogHeader>
				<DialogTitle>Delete wallet?</DialogTitle>
				<DialogDescription>
					<WarningMessage>
						This action will permanently delete your wallet and all associated spending history.
						This cannot be undone.
					</WarningMessage>
				</DialogDescription>
			</DialogHeader>
			<DialogFooter>
				<DialogClose asChild>
					<Button type="button" variant="secondary">
						Cancel
					</Button>
				</DialogClose>
				<Button variant="destructive" onClick={() => onDelete()}>
					Delete
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}

function WalletDropdownMenuWithModal({ id }: { id: string }) {
	const [open, setOpen] = useState(false);
	const [content, setContent] = useState<"none" | "edit" | "delete">("none");
	const mutation = useDeleteWallet();

	const handleOpenChange = (state: boolean) => {
		setOpen(state);
		if (state === false) {
			setContent("none");
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontalIcon className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DialogTrigger asChild onClick={() => setContent("edit")}>
						<DropdownMenuItem>Edit</DropdownMenuItem>
					</DialogTrigger>
					<DialogTrigger asChild onClick={() => setContent("delete")}>
						<DropdownMenuItem>
							<span className="text-destructive">Delete</span>
						</DropdownMenuItem>
					</DialogTrigger>
				</DropdownMenuContent>
			</DropdownMenu>
			{content === "edit" && <EditWalletDialogContent />}
			{content === "delete" && (
				<DeleteWalletDialogContent
					onDelete={async () => {
						await mutation.mutateAsync(id);
						handleOpenChange(false);
					}}
				/>
			)}
		</Dialog>
	);
}

export { CreateWalletDialog, CreateWalletDialogTrigger, WalletDropdownMenuWithModal };
