import { datetime, toFromToDateObject } from "@hoalu/datetime/datetime";
import { CopyIcon, MagnifyingGlassIcon, TrashIcon } from "@hoalu/icons/phosphor";
import { CalendarIcon, CashBanknoteMoveIcon } from "@hoalu/icons/tabler";
import { Button, type ButtonProps } from "@hoalu/ui/button";
import { Calendar } from "@hoalu/ui/calendar";
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
import { Popover, PopoverContent, PopoverTrigger } from "@hoalu/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { useValue } from "@legendapp/state/react";
import { Link, getRouteApi, useNavigate, useParams } from "@tanstack/react-router";

import { deleteExpenseDialog, searchKeywords$ } from "#app/atoms/index.ts";
import { type SyncedExpense } from "#app/components/expenses/use-expenses.ts";
import { WarningMessage } from "#app/components/warning-message.tsx";
import { useDeleteExpense, useDuplicateExpense } from "#app/services/mutations.ts";

const routeApi = getRouteApi("/_dashboard/$slug");
const expenseRouteApi = getRouteApi("/_dashboard/$slug/_toolbar-and-queue/transactions");

export function CreateExpenseTrigger(props: ButtonProps) {
	const { slug } = routeApi.useParams();
	return (
		<Button
			size="sm"
			variant="default"
			{...props}
			render={<Link to="/$slug/transactions/new" params={{ slug }} search={{ type: "expense" }} />}
		>
			<CashBanknoteMoveIcon className="size-3.5" />
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

export function ExpenseCalendar() {
	const { date: searchDate } = expenseRouteApi.useSearch();
	const navigate = expenseRouteApi.useNavigate();
	const range = toFromToDateObject(searchDate);

	const formatDateRange = () => {
		if (range?.from && range?.to) {
			return `${datetime.format(range.from, "MMM dd")} - ${datetime.format(range.to, "MMM dd, yyyy")}`;
		}
		return "Select date";
	};

	return (
		<Popover>
			<PopoverTrigger
				render={
					<Button
						variant="outline"
						className="h-auto w-full justify-start text-xs leading-none font-normal"
					/>
				}
			>
				<CalendarIcon className="size-4" />
				{formatDateRange()}
			</PopoverTrigger>
			<PopoverContent className="w-auto overflow-hidden p-0" align="start">
				<Calendar
					mode="range"
					captionLayout="dropdown"
					selected={range}
					onSelect={(selected) => {
						if (!selected) {
							navigate({ search: (s) => ({ ...s, date: undefined }) });
							return;
						}
						const { from, to } = selected;
						if (from && to) {
							const query = `${from.getTime()}-${to.getTime()}`;
							navigate({ search: (s) => ({ ...s, date: query }) });
						}
					}}
					className="[--cell-size:--spacing(9)]"
				/>
			</PopoverContent>
		</Popover>
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
