import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useAtom, useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { useEffect, useState } from "react";

import { datetime, toFromToDateObject } from "@hoalu/common/datetime";
import { CopyPlusIcon, SearchIcon, Trash2Icon } from "@hoalu/icons/lucide";
import { CalendarIcon } from "@hoalu/icons/tabler";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@hoalu/ui/accordion";
import { Button } from "@hoalu/ui/button";
import { Calendar } from "@hoalu/ui/calendar";
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
import { Input } from "@hoalu/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@hoalu/ui/popover";
import { Slot as SlotPrimitive } from "@hoalu/ui/slot";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { createExpenseDialogOpenAtom, draftExpenseAtom, searchKeywordsAtom } from "@/atoms";
import { useAppForm } from "@/components/forms";
import { HotKey } from "@/components/hotkey";
import { WarningMessage } from "@/components/warning-message";
import { AVAILABLE_REPEAT_OPTIONS, KEYBOARD_SHORTCUTS } from "@/helpers/constants";
import { useAuth } from "@/hooks/use-auth";
import { useSelectedExpense } from "@/hooks/use-expenses";
import { useWorkspace } from "@/hooks/use-workspace";
import { ExpenseFormSchema } from "@/lib/schema";
import {
	useCreateExpense,
	useDeleteExpense,
	useDuplicateExpense,
	useEditExpense,
	useUploadExpenseFiles,
} from "@/services/mutations";
import { expenseWithIdQueryOptions, walletsQueryOptions } from "@/services/query-options";

const routeApi = getRouteApi("/_dashboard/$slug");
const expenseRouteApi = getRouteApi("/_dashboard/$slug/expenses");

export function CreateExpenseDialogTrigger(props: React.PropsWithChildren) {
	const setOpen = useSetAtom(createExpenseDialogOpenAtom);

	if (props.children) {
		return <SlotPrimitive.Slot onClick={() => setOpen(true)}>{props.children}</SlotPrimitive.Slot>;
	}

	return (
		<Button variant="outline" onClick={() => setOpen(true)}>
			Create expense
			<HotKey {...KEYBOARD_SHORTCUTS.create_expense} />
		</Button>
	);
}

export function CreateExpenseDialogContent() {
	return (
		<DialogContent className="max-h-[92vh] overflow-y-scroll sm:max-w-[750px]">
			<DialogHeader>
				<DialogTitle>Create new expense</DialogTitle>
				<DialogDescription>Add a new transaction to track your spending.</DialogDescription>
			</DialogHeader>
			<CreateExpenseForm />
		</DialogContent>
	);
}

function CreateExpenseForm() {
	const { user } = useAuth();
	const { slug } = routeApi.useParams();
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(slug));
	const mutation = useCreateExpense();
	const expenseFilesMutation = useUploadExpenseFiles();

	const setOpen = useSetAtom(createExpenseDialogOpenAtom);
	const [draft, setDraft] = useAtom(draftExpenseAtom);

	const fallbackWallet = {
		label: wallets[0].name,
		value: wallets[0].id,
		currency: wallets[0].currency,
	};
	const walletGroups = wallets.reduce(
		(result, current) => {
			const owner = current.owner;
			if (!current.isActive) {
				return result;
			}
			if (!result[owner.id]) {
				result[owner.id] = {
					name: owner.name,
					options: [
						{
							label: current.name,
							value: current.id,
							currency: current.currency,
						},
					],
				};
			} else {
				result[owner.id].options.push({
					label: current.name,
					value: current.id,
					currency: current.currency,
				});
			}
			return result;
		},
		{} as Record<
			string,
			{ name: string; options: { label: string; value: string; currency: string }[] }
		>,
	);
	const userId = user?.id || "";
	const defaultWallet = walletGroups[userId]?.options[0] || fallbackWallet;

	const form = useAppForm({
		defaultValues: {
			title: draft.title,
			description: draft.description,
			date: draft.date,
			transaction: {
				value: draft.transaction.value,
				currency: draft.transaction.currency || defaultWallet.currency,
			},
			walletId: draft.walletId || defaultWallet.value,
			categoryId: draft.categoryId,
			repeat: draft.repeat,
			attachments: [],
		} as ExpenseFormSchema,
		validators: {
			onSubmit: ExpenseFormSchema,
		},
		onSubmit: async ({ value }) => {
			const expense = await mutation.mutateAsync({
				payload: {
					title: value.title,
					description: value.description,
					amount: value.transaction.value,
					currency: value.transaction.currency,
					date: value.date,
					walletId: value.walletId,
					categoryId: value.categoryId,
					repeat: value.repeat,
				},
			});
			setDraft(RESET);
			setOpen(false);
			if (value.attachments.length > 0) {
				await expenseFilesMutation.mutateAsync({
					...expense,
					files: value.attachments,
				});
			}
		},
	});

	useEffect(() => {
		return () => {
			if (!form.state.isSubmitted) {
				setDraft(form.state.values);
			}
		};
	}, [form.state.isSubmitted]);

	return (
		<form.AppForm>
			<form.Form>
				<div className="grid grid-cols-12 gap-4">
					<div className="col-span-7 flex flex-col gap-4">
						<form.AppField name="title">
							{(field) => <field.InputField label="Description" autoFocus required />}
						</form.AppField>
						<form.AppField name="transaction">
							{(field) => <field.TransactionAmountField label="Amount" />}
						</form.AppField>
						<div className="grid grid-cols-2 gap-4">
							<form.AppField name="walletId">
								{(field) => <field.SelectWithGroupsField label="Wallet" groups={walletGroups} />}
							</form.AppField>
							<form.AppField name="categoryId">
								{(field) => <field.SelectCategoryField label="Category" />}
							</form.AppField>
						</div>
						<form.AppField name="description">
							{(field) => <field.TiptapField label="Note" defaultValue={draft.description} />}
						</form.AppField>
					</div>
					<div className="col-span-5 flex flex-col gap-2.5">
						<form.AppField name="date">
							{(field) => <field.DatepickerInputField label="Date" />}
						</form.AppField>
						<form.AppField name="date">{(field) => <field.DatepickerField />}</form.AppField>
					</div>
					<div className="col-span-12">
						<Accordion type="single" collapsible className="w-full" defaultValue="advanced">
							<AccordionItem
								value="advanced"
								className="relative overflow-auto rounded-md border bg-background outline-none last:border-b has-focus-visible:z-10 has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
							>
								<AccordionTrigger className="rounded-none bg-muted px-4 py-2">
									More
								</AccordionTrigger>
								<AccordionContent className="grid grid-cols-12 gap-4 px-4 py-4">
									<div className="col-span-5 flex flex-col gap-4">
										<form.AppField name="repeat">
											{(field) => (
												<field.SelectField label="Repeat" options={AVAILABLE_REPEAT_OPTIONS} />
											)}
										</form.AppField>
									</div>
									<div className="col-span-7 flex flex-col gap-4">
										<form.AppField name="attachments">
											{(field) => <field.FilesField label="Attachments" />}
										</form.AppField>
									</div>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</div>
				</div>
				<div className="ml-auto flex gap-2">
					<Button
						variant="ghost"
						type="button"
						onClick={() => {
							setDraft(RESET);
							form.reset();
						}}
					>
						Reset
					</Button>
					<form.SubscribeButton useSound>Create expense</form.SubscribeButton>
				</div>
			</form.Form>
		</form.AppForm>
	);
}

export function DeleteExpense({ id }: { id: string }) {
	const [open, setOpen] = useState(false);
	const { onSelectExpense } = useSelectedExpense();
	const mutation = useDeleteExpense();

	const onDelete = async () => {
		await mutation.mutateAsync({ id });
		setOpen(false);
		onSelectExpense(null);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Tooltip>
				<TooltipTrigger asChild>
					<DialogTrigger
						render={
							<Button size="icon" variant="ghost" aria-label="Delete this expense">
								<Trash2Icon className="size-4" />
							</Button>
						}
					/>
				</TooltipTrigger>
				<TooltipContent side="bottom">Delete</TooltipContent>
			</Tooltip>
			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle>Delete this expense?</DialogTitle>
					<DialogDescription>
						<WarningMessage>
							The expense will be deleted and removed from your history. This action cannot be
							undone.
						</WarningMessage>
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose
						render={
							<Button type="button" variant="secondary">
								Cancel
							</Button>
						}
					/>
					<Button variant="destructive" onClick={() => onDelete()}>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function DuplicateExpense(props: { id: string }) {
	const workspace = useWorkspace();
	const mutation = useDuplicateExpense();
	const { data: expense } = useQuery(expenseWithIdQueryOptions(workspace.slug, props.id));

	const onDuplicate = () => {
		if (!expense) return;
		mutation.mutate({ sourceExpense: expense });
	};

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button size="icon" variant="ghost" onClick={onDuplicate} disabled={!expense}>
					<CopyPlusIcon className="size-4" />
				</Button>
			</TooltipTrigger>
			<TooltipContent side="bottom">Duplicate</TooltipContent>
		</Tooltip>
	);
}

export function EditExpenseForm(props: { id: string }) {
	const workspace = useWorkspace();
	const mutation = useEditExpense();
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(workspace.slug));
	const { data: expense, status } = useQuery(expenseWithIdQueryOptions(workspace.slug, props.id));

	const walletGroups = wallets.reduce(
		(result, current) => {
			const owner = current.owner;
			if (!current.isActive) {
				return result;
			}
			if (!result[owner.id]) {
				result[owner.id] = {
					name: owner.name,
					options: [
						{
							label: current.name,
							value: current.id,
							currency: current.currency,
						},
					],
				};
			} else {
				result[owner.id].options.push({
					label: current.name,
					value: current.id,
					currency: current.currency,
				});
			}
			return result;
		},
		{} as Record<
			string,
			{ name: string; options: { label: string; value: string; currency: string }[] }
		>,
	);

	const form = useAppForm({
		defaultValues: {
			title: expense?.title ?? "",
			description: expense?.description ?? "",
			date: expense?.date ?? "",
			transaction: {
				value: expense?.amount ?? 0,
				currency: expense?.currency ?? workspace.metadata.currency,
			},
			walletId: expense?.wallet.id ?? "",
			categoryId: expense?.category?.id ?? "",
			repeat: expense?.repeat ?? "one-time",
			attachments: [],
		} as ExpenseFormSchema,
		validators: {
			onSubmit: ExpenseFormSchema,
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				id: props.id,
				payload: {
					title: value.title,
					description: value.description,
					amount: value.transaction.value,
					currency: value.transaction.currency,
					date: value.date,
					walletId: value.walletId,
					categoryId: value.categoryId,
					repeat: value.repeat,
				},
			});
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
				<div className="grid grid-cols-1 gap-4 px-4">
					<form.AppField name="date">
						{(field) => <field.DatepickerInputField label="Date" />}
					</form.AppField>
					<form.AppField name="title">
						{(field) => <field.InputField label="Description" required />}
					</form.AppField>
					<form.AppField name="transaction">
						{(field) => <field.TransactionAmountField label="Amount" />}
					</form.AppField>
					<div className="grid grid-cols-2 gap-4">
						<form.AppField name="walletId">
							{(field) => <field.SelectWithGroupsField label="Wallet" groups={walletGroups} />}
						</form.AppField>
						<form.AppField name="categoryId">
							{(field) => <field.SelectCategoryField label="Category" />}
						</form.AppField>
					</div>
					<form.AppField name="description">
						{(field) => (
							<field.TiptapField label="Note" defaultValue={expense?.description ?? ""} />
						)}
					</form.AppField>
					<form.AppField name="repeat">
						{(field) => <field.SelectField label="Repeat" options={AVAILABLE_REPEAT_OPTIONS} />}
					</form.AppField>
					<form.AppField name="attachments">
						{(field) => <field.FilesField label="Attachments" />}
					</form.AppField>
				</div>
				<div className="sticky bottom-0 flex w-full justify-end gap-2 border-t bg-card px-4 py-2">
					<Button variant="ghost" type="button" onClick={() => form.reset()} tabIndex={-1}>
						Reset
					</Button>
					<form.SubscribeButton useSound>Update</form.SubscribeButton>
				</div>
			</form.Form>
		</form.AppForm>
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
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className="h-auto w-full justify-start font-normal text-xs leading-none"
				>
					<CalendarIcon className="size-4" />
					{formatDateRange()}
				</Button>
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
	const [value, setValue] = useAtom(searchKeywordsAtom);

	return (
		<div className="relative">
			<Input
				type="search"
				placeholder="Search"
				className="peer ps-9 focus-visible:ring-0"
				value={value}
				onChange={(e) => {
					setValue(e.target.value);
				}}
			/>
			<div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
				<SearchIcon size={16} aria-hidden="true" />
			</div>
		</div>
	);
}
