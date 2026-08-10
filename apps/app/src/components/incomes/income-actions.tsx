import { CopyIcon, TrashIcon } from "@hoalu/icons/phosphor";
import { CashPlusIcon } from "@hoalu/icons/tabler";
import { Button, type ButtonProps } from "@hoalu/ui/button";
import {
	DialogClose,
	DialogFooter,
	DialogHeader,
	DialogHeaderAction,
	DialogPopup,
	DialogTitle,
} from "@hoalu/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { useValue } from "@legendapp/state/react";
import { Link, getRouteApi, useNavigate, useParams } from "@tanstack/react-router";

import { deleteIncomeDialog } from "#app/atoms/index.ts";
import { type SyncedIncome } from "#app/components/incomes/use-incomes.ts";
import { WarningMessage } from "#app/components/warning-message.tsx";
import { useDeleteIncome, useDuplicateIncome } from "#app/services/mutations.ts";

const routeApi = getRouteApi("/_dashboard/$slug");

export function CreateIncomeTrigger(props: ButtonProps) {
	const { slug } = routeApi.useParams();
	return (
		<Button
			size="sm"
			variant="outline"
			{...props}
			render={<Link to="/$slug/transactions/new" params={{ slug }} search={{ type: "income" }} />}
		>
			<CashPlusIcon className="text-success size-3.5" />
			New income
		</Button>
	);
}

export function DeleteIncome({ id }: { id: string }) {
	const setDialog = deleteIncomeDialog.set;

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						size="icon"
						variant="outline"
						aria-label="Delete this income"
						onClick={() => setDialog({ state: true, data: { id } })}
					/>
				}
			>
				<TrashIcon className="size-4" />
			</TooltipTrigger>
			<TooltipContent side="bottom">Delete</TooltipContent>
		</Tooltip>
	);
}

export function DeleteIncomeDialogContent() {
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const navigate = useNavigate();
	const mutation = useDeleteIncome();
	const dialog = useValue(deleteIncomeDialog.$);
	const setDialog = deleteIncomeDialog.set;

	const onDelete = async () => {
		if (!dialog?.data?.id) {
			setDialog({ state: false });
			return;
		}
		await mutation.mutateAsync({ id: dialog.data.id });
		setDialog({ state: false });
		navigate({ to: "/$slug/transactions", params: { slug } });
	};

	return (
		<DialogPopup className="sm:max-w-[480px]">
			<DialogHeader>
				<DialogTitle>Delete this income?</DialogTitle>
				<DialogHeaderAction />
			</DialogHeader>
			<WarningMessage>
				The income will be deleted and removed from your history. This action cannot be undone.
			</WarningMessage>
			<DialogFooter>
				<DialogClose render={<Button variant="outline">Cancel</Button>} />
				<Button variant="destructive" onClick={onDelete}>
					Delete
				</Button>
			</DialogFooter>
		</DialogPopup>
	);
}

export function DuplicateIncome(props: { data: SyncedIncome }) {
	const mutation = useDuplicateIncome();
	const onDuplicate = () => {
		mutation.mutate({ sourceIncome: props.data });
	};

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						size="icon"
						variant="outline"
						aria-label="Duplicate this income"
						onClick={onDuplicate}
					/>
				}
			>
				<CopyIcon className="size-4" />
			</TooltipTrigger>
			<TooltipContent side="bottom">Duplicate</TooltipContent>
		</Tooltip>
	);
}
