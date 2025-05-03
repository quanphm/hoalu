import { createWalletDialogOpenAtom } from "@/atoms";
import { useAppForm } from "@/components/forms";
import { HotKeyWithTooltip } from "@/components/hotkey";
import { WarningMessage } from "@/components/warning-message";
import { createWalletTheme } from "@/helpers/colors";
import {
	AVAILABLE_CURRENCY_OPTIONS,
	AVAILABLE_WALLET_TYPE_OPTIONS,
	KEYBOARD_SHORTCUTS,
} from "@/helpers/constants";
import { useWorkspace } from "@/hooks/use-workspace";
import { WalletFormSchema, type WalletPatchSchema, type WalletTypeSchema } from "@/lib/schema";
import { useCreateWallet, useDeleteWallet, useEditWallet } from "@/services/mutations";
import { walletWithIdQueryOptions } from "@/services/query-options";
import {
	BitcoinIcon,
	WalletIcon as CashIcon,
	CreditCardIcon,
	LandmarkIcon,
	MoreVerticalIcon,
} from "@hoalu/icons/lucide";
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
import { cn } from "@hoalu/ui/utils";
import { useQuery } from "@tanstack/react-query";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useState } from "react";

function CreateWalletDialog({ children }: { children: React.ReactNode }) {
	const [dialog, setOpen] = useAtom(createWalletDialogOpenAtom);

	return (
		<Dialog open={dialog.isOpen} onOpenChange={setOpen}>
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
				<DialogDescription>
					Add a new wallet to manage and track a separate set of funds or accounts.
				</DialogDescription>
				<CreateWalletForm />
			</DialogContent>
		</Dialog>
	);
}

function CreateWalletDialogTrigger({ children }: { children: React.ReactNode }) {
	const setOpen = useSetAtom(createWalletDialogOpenAtom);

	return (
		<HotKeyWithTooltip onClick={() => setOpen(true)} shortcut={KEYBOARD_SHORTCUTS.create_wallet}>
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
			onSubmit: WalletFormSchema,
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				payload: {
					name: value.name,
					description: value.description,
					currency: value.currency,
					type: value.type,
				},
			});
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
					{(field) => (
						<field.InputField
							placeholder="Physical wallet"
							label="Description"
							autoComplete="off"
						/>
					)}
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

function EditWalletForm(props: { id: string; onEditCallback?(): void }) {
	const workspace = useWorkspace();
	const { data: wallet, status } = useQuery(walletWithIdQueryOptions(workspace.slug, props.id));
	const mutation = useEditWallet();

	console.log(workspace.members);
	console.log(wallet?.owner.id);

	const form = useAppForm({
		defaultValues: {
			name: wallet?.name ?? "",
			description: wallet?.description ?? "",
			currency: wallet?.currency ?? "",
			type: wallet?.type ?? "",
			isActive: wallet?.isActive ?? true,
			ownerId: wallet?.owner.id ?? "",
		} as WalletPatchSchema,
		validators: {
			onSubmit: WalletFormSchema,
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				id: props.id,
				payload: {
					name: value.name,
					description: value.description,
					currency: value.currency,
					type: value.type,
					isActive: value.isActive,
					ownerId: value.ownerId,
				},
			});
			if (props.onEditCallback) props.onEditCallback();
		},
	});

	useEffect(() => {
		if (status === "success") {
			form.reset();
		}
	}, [status, form.reset]);

	return (
		<form.AppForm>
			<form.Form>
				<form.AppField name="name">
					{(field) => (
						<field.InputField label="Name" placeholder="My cash wallet" autoFocus required />
					)}
				</form.AppField>
				<form.AppField name="description">
					{(field) => (
						<field.InputField
							placeholder="Physical wallet"
							label="Description"
							autoComplete="off"
						/>
					)}
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
				<form.AppField name="isActive">
					{(field) => (
						<field.SwitchField
							label="In use"
							description={
								field.state.value === false
									? "You won't be able to create new expense with this wallet."
									: ""
							}
						/>
					)}
				</form.AppField>
				<form.AppField name="ownerId">
					{(field) => (
						<field.SelectField
							label="Owner"
							description="You can transfer wallet ownership to the others"
							options={workspace.members.map((member) => {
								return {
									label: member.user.name,
									value: member.user.id,
								};
							})}
						/>
					)}
				</form.AppField>
				<Button type="submit" className="ml-auto w-fit">
					Update
				</Button>
			</form.Form>
		</form.AppForm>
	);
}

function EditWalletDialogContent(props: { id: string; onEditCallback?(): void }) {
	return (
		<DialogContent className="sm:max-w-[480px]">
			<DialogHeader>
				<DialogTitle>Edit wallet</DialogTitle>
				<DialogDescription>Update your wallet details.</DialogDescription>
			</DialogHeader>
			<EditWalletForm id={props.id} onEditCallback={props.onEditCallback} />
		</DialogContent>
	);
}

function DeleteWalletDialogContent(props: { id: string; onDeleteCallback?(): void }) {
	const mutation = useDeleteWallet();
	const onDelete = async () => {
		await mutation.mutateAsync({ id: props.id });
		if (props.onDeleteCallback) props.onDeleteCallback();
	};

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
						<MoreVerticalIcon className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DialogTrigger asChild onClick={() => setContent("edit")}>
						<DropdownMenuItem>Edit</DropdownMenuItem>
					</DialogTrigger>
					<DialogTrigger asChild onClick={() => setContent("delete")}>
						<DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
					</DialogTrigger>
				</DropdownMenuContent>
			</DropdownMenu>
			{content === "edit" && (
				<EditWalletDialogContent id={id} onEditCallback={() => handleOpenChange(false)} />
			)}
			{content === "delete" && (
				<DeleteWalletDialogContent id={id} onDeleteCallback={() => handleOpenChange(false)} />
			)}
		</Dialog>
	);
}

const icons: Record<WalletTypeSchema, any> = {
	cash: CashIcon,
	"bank-account": LandmarkIcon,
	"credit-card": CreditCardIcon,
	"debit-card": CreditCardIcon,
	"digital-account": BitcoinIcon,
};
function WalletIcon(props: { type: WalletTypeSchema }) {
	if (!icons[props.type]) {
		throw new Error("unknown wallet type");
	}
	const className = cn(createWalletTheme(props.type), "bg-transparent size-4");
	const Icon = icons[props.type];
	return <Icon className={className} />;
}

export { CreateWalletDialog, CreateWalletDialogTrigger, WalletDropdownMenuWithModal, WalletIcon };
