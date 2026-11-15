import {
	BankIcon,
	CreditCardIcon,
	CurrencyBtcIcon,
	DotsThreeVerticalIcon,
	WalletIcon as CashIcon,
} from "@hoalu/icons/phosphor";
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
import { cn } from "@hoalu/ui/utils";
import { useValue } from "@legendapp/state/react";
import { useNavigate, useParams } from "@tanstack/react-router";

import { deleteWalletDialog } from "#app/atoms/index.ts";
import { WarningMessage } from "#app/components/warning-message.tsx";
import { createWalletTheme } from "#app/helpers/colors.ts";
import { useDeleteWallet } from "#app/services/mutations.ts";

import type { WalletTypeSchema } from "@hoalu/schema/schema";

export function WalletDropdownMenu({ id }: { id: string }) {
	const setDeleteDialog = deleteWalletDialog.set;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant="ghost"
						size="icon"
						onClick={(e) => {
							e.stopPropagation();
						}}
					/>
				}
			>
				<span className="sr-only">Open menu</span>
				<DotsThreeVerticalIcon className="size-4" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
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

export function DeleteWalletDialogContent() {
	const navigate = useNavigate();
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const dialog = useValue(deleteWalletDialog.$);
	const setDialog = deleteWalletDialog.set;
	const mutation = useDeleteWallet();
	const onDelete = async () => {
		if (!dialog?.data?.id) {
			setDialog({ state: false });
			return;
		}
		await mutation.mutateAsync({ id: dialog.data.id });
		navigate({ to: "/$slug/wallets", params: { slug } });
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

const icons: Record<WalletTypeSchema, any> = {
	cash: CashIcon,
	"bank-account": BankIcon,
	"credit-card": CreditCardIcon,
	"debit-card": CreditCardIcon,
	"digital-account": CurrencyBtcIcon,
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
