import { useQuery } from "@tanstack/react-query";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

import {
	BitcoinIcon,
	WalletIcon as CashIcon,
	CreditCardIcon,
	LandmarkIcon,
	MoreVerticalIcon,
} from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import {
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogPopup,
	DialogTitle,
} from "@hoalu/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@hoalu/ui/dropdown-menu";
import { Slot as SlotPrimitive } from "@hoalu/ui/slot";
import { cn } from "@hoalu/ui/utils";
import { createWalletDialogAtom, deleteWalletDialogAtom, editWalletDialogAtom } from "@/atoms";
import { useAppForm } from "@/components/forms";
import { HotKey } from "@/components/hotkey";
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

export function CreateWalletDialogTrigger(props: React.PropsWithChildren) {
	const setDialog = useSetAtom(createWalletDialogAtom);

	if (props.children) {
		return (
			<SlotPrimitive.Slot onClick={() => setDialog({ state: true })}>
				{props.children}
			</SlotPrimitive.Slot>
		);
	}

	return (
		<Button variant="outline" onClick={() => setDialog({ state: true })}>
			Create wallet
			<HotKey {...KEYBOARD_SHORTCUTS.create_wallet} />
		</Button>
	);
}

export function CreateWalletDialogContent() {
	return (
		<DialogPopup className="sm:max-w-[480px]">
			<DialogHeader>
				<DialogTitle>Create new wallet</DialogTitle>
				<DialogDescription>
					Add a new wallet to manage and track a separate set of funds or accounts.
				</DialogDescription>
			</DialogHeader>
			<CreateWalletForm />
		</DialogPopup>
	);
}

function CreateWalletForm() {
	const {
		metadata: { currency: workspaceCurrency },
	} = useWorkspace();
	const setDialog = useSetAtom(createWalletDialogAtom);
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
			setDialog({ state: false });
		},
	});

	return (
		<form.AppForm>
			<form.Form>
				<form.AppField name="name">
					{(field) => <field.InputField label="Name" placeholder="My cash wallet" required />}
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
				<form.SubscribeButton useSound className="ml-auto w-fit">
					Create wallet
				</form.SubscribeButton>
			</form.Form>
		</form.AppForm>
	);
}

function EditWalletForm(props: { id: string }) {
	const workspace = useWorkspace();
	const { data: wallet, status } = useQuery(walletWithIdQueryOptions(workspace.slug, props.id));
	const mutation = useEditWallet();
	const setDialog = useSetAtom(editWalletDialogAtom);

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
			setDialog({ state: false, data: { id: null } });
		},
	});

	useEffect(() => {
		if (status === "success") {
			form.reset();
		}
	}, [status]);

	return (
		<form.AppForm>
			<form.Form>
				<form.AppField name="name">
					{(field) => <field.InputField label="Name" placeholder="My cash wallet" required />}
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
							description="Give wallet ownership to the others"
							options={workspace.members.map((member) => {
								return {
									label: member.user.name,
									value: member.user.id,
								};
							})}
						/>
					)}
				</form.AppField>
				<form.SubscribeButton useSound className="ml-auto w-fit">
					Update
				</form.SubscribeButton>
			</form.Form>
		</form.AppForm>
	);
}

export function EditWalletDialogContent() {
	const dialog = useAtomValue(editWalletDialogAtom);

	return (
		<DialogPopup className="sm:max-w-[480px]">
			<DialogHeader>
				<DialogTitle>Edit wallet</DialogTitle>
				<DialogDescription>Update your wallet details.</DialogDescription>
			</DialogHeader>
			<EditWalletForm id={dialog?.data?.id} />
		</DialogPopup>
	);
}

export function DeleteWalletDialogContent() {
	const [dialog, setDialog] = useAtom(deleteWalletDialogAtom);
	const mutation = useDeleteWallet();
	const onDelete = async () => {
		if (!dialog?.data?.id) {
			// [TODO] Should throw error here.
			return;
		}
		await mutation.mutateAsync({ id: dialog.data.id });
		setDialog({ state: false, data: { id: null } });
	};

	return (
		<DialogPopup className="sm:max-w-[480px]">
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
				<DialogClose render={<Button type="button" variant="secondary" />}>Cancel</DialogClose>
				<Button variant="destructive" onClick={() => onDelete()}>
					Delete
				</Button>
			</DialogFooter>
		</DialogPopup>
	);
}

export function WalletDropdownMenuWithModal({ id }: { id: string }) {
	const setEditDialog = useSetAtom(editWalletDialogAtom);
	const setDeleteDialog = useSetAtom(deleteWalletDialogAtom);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0">
					<span className="sr-only">Open menu</span>
					<MoreVerticalIcon className="size-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => setEditDialog({ state: true, data: { id } })}>
					Edit
				</DropdownMenuItem>
				<DropdownMenuItem
					variant="destructive"
					onClick={() => setDeleteDialog({ state: true, data: { id } })}
				>
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

const icons: Record<WalletTypeSchema, any> = {
	cash: CashIcon,
	"bank-account": LandmarkIcon,
	"credit-card": CreditCardIcon,
	"debit-card": CreditCardIcon,
	"digital-account": BitcoinIcon,
};

export interface WalletIconProps {
	type: WalletTypeSchema;
}

export function WalletIcon(props: WalletIconProps) {
	if (!icons[props.type]) {
		throw new Error("unknown wallet type");
	}
	const className = cn(createWalletTheme(props.type), "bg-transparent size-4");
	const Icon = icons[props.type];
	return <Icon className={className} />;
}
