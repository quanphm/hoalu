import {
	createWalletDialogAtom,
	deleteWalletDialogAtom,
	editWalletDialogAtom,
} from "#app/atoms/index.ts";
import { useAppForm } from "#app/components/forms/index.tsx";
import { HotKey } from "#app/components/hotkey.tsx";
import { WarningMessage } from "#app/components/warning-message.tsx";
import { createWalletTheme } from "#app/helpers/colors.ts";
import {
	AVAILABLE_CURRENCY_OPTIONS,
	AVAILABLE_WALLET_TYPE_OPTIONS,
	KEYBOARD_SHORTCUTS,
} from "#app/helpers/constants.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { WalletFormSchema, type WalletPatchSchema } from "#app/lib/schema.ts";
import { useCreateWallet, useDeleteWallet, useEditWallet } from "#app/services/mutations.ts";
import { walletWithIdQueryOptions } from "#app/services/query-options.ts";
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
	DialogFooter,
	DialogHeader,
	DialogHeaderAction,
	DialogPopup,
	DialogTitle,
} from "@hoalu/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@hoalu/ui/dropdown-menu";
import { Field, FieldGroup } from "@hoalu/ui/field";
import { cn } from "@hoalu/ui/utils";
import { useQuery } from "@tanstack/react-query";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import type { WalletTypeSchema } from "@hoalu/common/schema";

export function CreateWalletDialogTrigger() {
	const setDialog = useSetAtom(createWalletDialogAtom);

	return (
		<Button size="sm" onClick={() => setDialog({ state: true })}>
			Create wallet
			<HotKey
				{...KEYBOARD_SHORTCUTS.create_wallet}
				className="text-background ml-0.5 bg-black/25 font-bold"
			/>
		</Button>
	);
}

export function CreateWalletDialogContent() {
	return (
		<DialogPopup className="sm:max-w-[520px]" showCloseButton={false}>
			<DialogHeader>
				<DialogTitle>Create new wallet</DialogTitle>
				<DialogHeaderAction />
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
				<FieldGroup>
					<form.AppField
						name="name"
						children={(field) => (
							<field.InputField label="Name" placeholder="My cash wallet" required />
						)}
					/>
					<form.AppField
						name="description"
						children={(field) => (
							<field.InputField
								placeholder="Physical wallet"
								label="Description"
								autoComplete="off"
							/>
						)}
					/>
				</FieldGroup>
				<FieldGroup className="grid grid-cols-2 gap-4">
					<form.AppField
						name="type"
						children={(field) => (
							<field.SelectField label="Type" options={AVAILABLE_WALLET_TYPE_OPTIONS} />
						)}
					/>
					<form.AppField
						name="currency"
						children={(field) => (
							<field.SelectField label="Default currency" options={AVAILABLE_CURRENCY_OPTIONS} />
						)}
					/>
				</FieldGroup>

				<DialogFooter>
					<Field orientation="horizontal">
						<form.SubscribeButton className="ml-auto w-fit">Create wallet</form.SubscribeButton>
					</Field>
				</DialogFooter>
			</form.Form>
		</form.AppForm>
	);
}

function EditWalletForm(props: { id: string }) {
	const workspace = useWorkspace();
	const { data: wallet } = useQuery(walletWithIdQueryOptions(workspace.slug, props.id));
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
			setDialog({ state: false });
		},
	});

	return (
		<form.AppForm>
			<form.Form>
				<FieldGroup>
					<form.AppField
						name="name"
						children={(field) => (
							<field.InputField label="Name" placeholder="My cash wallet" required />
						)}
					/>
					<form.AppField
						name="description"
						children={(field) => (
							<field.InputField
								placeholder="Physical wallet"
								label="Description"
								autoComplete="off"
							/>
						)}
					/>
					<div className="grid grid-cols-2 gap-4">
						<form.AppField
							name="type"
							children={(field) => (
								<field.SelectField label="Type" options={AVAILABLE_WALLET_TYPE_OPTIONS} />
							)}
						/>
						<form.AppField
							name="currency"
							children={(field) => (
								<field.SelectField label="Default currency" options={AVAILABLE_CURRENCY_OPTIONS} />
							)}
						/>
					</div>
					<form.AppField
						name="isActive"
						children={(field) => (
							<field.SwitchField
								label="In use"
								description={
									field.state.value === false
										? "You won't be able to create new expense with this wallet"
										: ""
								}
							/>
						)}
					/>
					<form.AppField
						name="ownerId"
						children={(field) => (
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
					/>
				</FieldGroup>
				<Field orientation="horizontal">
					<form.SubscribeButton className="ml-auto w-fit">Update</form.SubscribeButton>
				</Field>
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
				<DialogHeaderAction />
			</DialogHeader>
			<EditWalletForm key={dialog?.data?.id} id={dialog?.data?.id} />
		</DialogPopup>
	);
}

export function DeleteWalletDialogContent() {
	const [dialog, setDialog] = useAtom(deleteWalletDialogAtom);
	const mutation = useDeleteWallet();
	const onDelete = async () => {
		if (!dialog?.data?.id) {
			setDialog({ state: false });
			return;
		}
		await mutation.mutateAsync({ id: dialog.data.id });
		setDialog({ state: false });
	};

	return (
		<DialogPopup className="sm:max-w-[480px]">
			<DialogHeader>
				<DialogTitle>Delete wallet?</DialogTitle>
				<DialogHeaderAction />
			</DialogHeader>
			<WarningMessage>
				This action will permanently delete your wallet and all associated spending history. This
				cannot be undone.
			</WarningMessage>
			<DialogFooter>
				<DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
				<Button variant="destructive" onClick={onDelete}>
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
			<DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
				<span className="sr-only">Open menu</span>
				<MoreVerticalIcon className="size-4" />
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
	const className = cn(createWalletTheme(props.type), "size-4 bg-transparent");
	const Icon = icons[props.type];
	return <Icon className={className} />;
}
