import { CopyIcon, MagnifyingGlassIcon, TrashIcon, MoneyIcon } from "@hoalu/icons/phosphor";
import { Button, type ButtonProps } from "@hoalu/ui/button";
import {
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogHeaderAction,
	DialogPopup,
	DialogTitle,
} from "@hoalu/ui/dialog";
import { Input } from "@hoalu/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { useValue } from "@legendapp/state/react";
import { Link, getRouteApi, useNavigate, useParams } from "@tanstack/react-router";

import { deleteExpenseDialog, searchKeywords$ } from "#app/atoms/index.ts";
import { type SyncedExpense } from "#app/components/expenses/use-expenses.ts";
import { WarningMessage } from "#app/components/warning-message.tsx";
import { useDeleteExpense, useDuplicateExpense } from "#app/services/mutations.ts";

const routeApi = getRouteApi("/_dashboard/$slug");

export function CreateExpenseTrigger(props: ButtonProps) {
	const { slug } = routeApi.useParams();
	return (
		<Button
			size="sm"
			variant="default"
			{...props}
			render={<Link to="/$slug/transactions/new" params={{ slug }} search={{ type: "expense" }} />}
		>
			<MoneyIcon className="size-3.5" />
			New expense
		</Button>
	);
}

export function DeleteExpense({ id }: { id: string }) {
	const setDialog = deleteExpenseDialog.set;

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						size="icon-sm"
						variant="outline"
						aria-label="Delete this expense"
						onClick={() => setDialog({ state: true, data: { id } })}
					/>
				}
			>
				<TrashIcon />
			</TooltipTrigger>
			<TooltipContent side="bottom">Delete</TooltipContent>
		</Tooltip>
	);
}

export function DeleteExpenseDialogContent() {
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const navigate = useNavigate();
	const mutation = useDeleteExpense();
	const dialog = useValue(deleteExpenseDialog.$);
	const setDialog = deleteExpenseDialog.set;

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
				<DialogTitle>Delete this expense?</DialogTitle>
				<DialogHeaderAction />
			</DialogHeader>
			<WarningMessage>
				The expense will be deleted and removed from your history. This action cannot be undone.
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

export function DuplicateExpense(props: { data: SyncedExpense }) {
	const mutation = useDuplicateExpense();
	const onDuplicate = () => {
		mutation.mutate({ sourceExpense: props.data });
	};

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						size="icon-sm"
						variant="outline"
						aria-label="Duplicate this expense"
						onClick={onDuplicate}
					/>
				}
			>
				<CopyIcon />
			</TooltipTrigger>
			<TooltipContent side="bottom">Duplicate</TooltipContent>
		</Tooltip>
	);
}

export function ExpenseSearch() {
	const value = useValue(searchKeywords$);
	const setValue = searchKeywords$.set;

	return (
		<div className="relative w-80">
			<Input
				type="search"
				size="sm"
				aria-label="Search transactions"
				placeholder="Search title, description..."
				className="peer ps-6 focus-visible:ring-0"
				value={value}
				onChange={(e) => {
					setValue(e.target.value);
				}}
			/>
			<div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
				<MagnifyingGlassIcon className="text-muted-foreground size-3" aria-hidden="true" />
			</div>
		</div>
	);
}
