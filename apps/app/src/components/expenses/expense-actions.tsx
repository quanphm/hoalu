import {
	createExpenseDialogAtom,
	deleteExpenseDialogAtom,
	draftExpenseAtom,
	logPaymentAtom,
	scannedReceiptsAtom,
	searchKeywordsAtom,
} from "#app/atoms/index.ts";
import { type SyncedExpense, useSelectedExpense } from "#app/components/expenses/use-expenses.ts";
import { FilesCompactUpload, type FilesCompactUploadRef } from "#app/components/files/files-compact-upload.tsx";
import { useAppForm } from "#app/components/forms/index.tsx";
import { HotKey } from "#app/components/hotkey.tsx";
import { useLiveQueryRecurringBills } from "#app/components/recurring-bills/use-recurring-bills.ts";
import { WarningMessage } from "#app/components/warning-message.tsx";
import { AVAILABLE_REPEAT_OPTIONS, KEYBOARD_SHORTCUTS } from "#app/helpers/constants.ts";
import { useAuth } from "#app/hooks/use-auth.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { ExpenseFormSchema } from "#app/lib/schema.ts";
import {
	useCreateExpense,
	useDeleteExpense,
	useDuplicateExpense,
	useEditExpense,
	useUploadExpenseFiles,
} from "#app/services/mutations.ts";
import { categoriesQueryOptions, walletsQueryOptions } from "#app/services/query-options.ts";
import { datetime, toFromToDateObject } from "@hoalu/common/datetime";
import { CopyPlusIcon, SearchIcon, Trash2Icon } from "@hoalu/icons/lucide";
import { CalendarIcon } from "@hoalu/icons/tabler";
import { Button, type ButtonProps } from "@hoalu/ui/button";
import { Calendar } from "@hoalu/ui/calendar";
import {
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogPopup,
	DialogTitle,
} from "@hoalu/ui/dialog";
import { Field, FieldGroup } from "@hoalu/ui/field";
import { useLocalStorage } from "@hoalu/ui/hooks";
import { Input } from "@hoalu/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@hoalu/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useAtom, useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { useEffect, useRef } from "react";

const routeApi = getRouteApi("/_dashboard/$slug");
const expenseRouteApi = getRouteApi("/_dashboard/$slug/expenses");

export function CreateExpenseDialogTrigger({
	showKbd = true,
	...props
}: ButtonProps & { showKbd?: boolean }) {
	const setDialog = useSetAtom(createExpenseDialogAtom);

	return (
		<Button variant="outline" {...props} onClick={() => setDialog({ state: true })}>
			Create expense
			{showKbd && <HotKey {...KEYBOARD_SHORTCUTS.create_expense} />}
		</Button>
	);
}

export function CreateExpenseDialogContent() {
	return (
		<DialogPopup className="max-h-[92vh] overflow-y-scroll sm:max-w-[750px]">
			<DialogHeader>
				<DialogTitle>Create new expense</DialogTitle>
				<DialogDescription>Add a new transaction to track your spending.</DialogDescription>
			</DialogHeader>
			<CreateExpenseForm />
		</DialogPopup>
	);
}

function CreateExpenseForm() {
	const { user } = useAuth();
	const { slug } = routeApi.useParams();
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(slug));
	const mutation = useCreateExpense();
	const expenseFilesMutation = useUploadExpenseFiles();
	const filesUploadRef = useRef<FilesCompactUploadRef>(null);

	const setDialog = useSetAtom(createExpenseDialogAtom);
	const [draft, setDraft] = useAtom(draftExpenseAtom);
	const [logPayment, setLogPayment] = useAtom(logPaymentAtom);
	const [scannedReceipts, setScannedReceipts] = useAtom(scannedReceiptsAtom);

	const [lastUsedWalletId, setLastUsedWalletId] = useLocalStorage<string | null>(
		`last_used_wallet_${slug}`,
		null,
	);
	const [lastUsedCategoryId, setLastUsedCategoryId] = useLocalStorage<string | null>(
		`last_used_category_${slug}`,
		null,
	);

	const { data: categories } = useSuspenseQuery(categoriesQueryOptions(slug));

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

	const validLastWallet =
		lastUsedWalletId && wallets.some((w) => w.id === lastUsedWalletId && w.isActive)
			? lastUsedWalletId
			: null;
	const validLastCategory =
		lastUsedCategoryId && categories.some((c) => c.id === lastUsedCategoryId)
			? lastUsedCategoryId
			: null;

	const initialWallet = draft.walletId || validLastWallet || defaultWallet.value;
	const initialCategory = draft.categoryId || validLastCategory;
	const initialRecurringBillId = logPayment.recurringBillId || undefined;

	const form = useAppForm({
		defaultValues: {
			title: draft.title,
			description: draft.description,
			date: draft.date || new Date().toISOString(),
			transaction: {
				value: draft.transaction.value,
				currency: draft.transaction.currency || defaultWallet.currency,
			},
			walletId: initialWallet,
			categoryId: initialCategory,
			repeat: draft.repeat,
			recurringBillId: initialRecurringBillId,
			// Pre-populate scanned receipt files so they're uploaded on submit
			attachments: scannedReceipts.length > 0 ? scannedReceipts : [],
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
					...(value.recurringBillId ? { recurringBillId: value.recurringBillId } : {}),
				},
			});

			setDraft(RESET);
			setLogPayment({ recurringBillId: null });
			setScannedReceipts([]);
			setDialog({ state: false });
			setLastUsedWalletId(value.walletId);
			if (value.categoryId) {
				setLastUsedCategoryId(value.categoryId);
			}

			if (value.attachments.length > 0) {
				await expenseFilesMutation.mutateAsync({
					id: expense.id,
					title: expense.title,
					date: expense.date,
					files: value.attachments,
				});
				filesUploadRef.current?.clearFiles();
				form.setFieldValue("attachments", []);
			}
		},
	});

	useEffect(() => {
		return () => {
			if (!form.state.isSubmitted) {
				setDraft(form.state.values);
			}
		};
	}, [form.state.isSubmitted, setDraft, form.state.values]);

	return (
		<form.AppForm>
			<form.Form>
				<div className="grid grid-cols-12 gap-4">
					<FieldGroup className="col-span-12 flex flex-col gap-4 md:col-span-7">
						<form.AppField
							name="title"
							children={(field) => <field.InputField label="Title" required />}
						/>
						<form.AppField
							name="transaction"
							children={(field) => <field.TransactionAmountField label="Amount" />}
						/>
						<div className="grid grid-cols-2 gap-4">
							<form.AppField
								name="walletId"
								children={(field) => (
									<field.SelectWithGroupsField label="Wallet" groups={walletGroups} />
								)}
							/>
							<form.AppField
								name="categoryId"
								children={(field) => <field.SelectCategoryField label="Category" />}
							/>
						</div>
						<form.Subscribe
							selector={(s) => s.values.repeat}
							children={(repeat) => (
								<div className={repeat === "one-time" ? "" : "grid grid-cols-2 gap-4"}>
									<form.AppField
										name="repeat"
										children={(field) => (
											<field.SelectField label="Repeat" options={AVAILABLE_REPEAT_OPTIONS} />
										)}
									/>
									{repeat !== "one-time" && (
										<form.AppField
											name="recurringBillId"
											children={(field) => (
												<field.SelectRecurringBillField label="Recurring bill" repeat={repeat} />
											)}
										/>
									)}
								</div>
							)}
						/>
						<form.AppField
							name="description"
							children={(field) => (
								<field.TiptapField label="Note" defaultValue={draft.description} />
							)}
						/>
					</FieldGroup>
					<FieldGroup className="col-span-12 flex flex-col gap-2.5 md:col-span-5">
						<form.AppField
							name="date"
							children={(field) => <field.DatepickerInputField label="Date" />}
						/>
						<form.AppField name="date" children={(field) => <field.DatepickerField />} />
					</FieldGroup>
				</div>

				<FilesCompactUpload
					ref={filesUploadRef}
					onFilesSelectedUpdate={(files) => form.setFieldValue("attachments", files)}
				>
					{(trigger) => (
						<DialogFooter>
							<Field orientation="horizontal" className="justify-between">
								{trigger}
								<form.SubscribeButton>Create expense</form.SubscribeButton>
							</Field>
						</DialogFooter>
					)}
				</FilesCompactUpload>
			</form.Form>
		</form.AppForm>
	);
}

export function DeleteExpense({ id }: { id: string }) {
	const setDialog = useSetAtom(deleteExpenseDialogAtom);

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						size="icon"
						variant="ghost"
						aria-label="Delete this expense"
						onClick={() => setDialog({ state: true, data: { id } })}
					/>
				}
			>
				<Trash2Icon className="size-4" />
			</TooltipTrigger>
			<TooltipContent side="bottom">Delete</TooltipContent>
		</Tooltip>
	);
}

export function DeleteExpenseDialogContent() {
	const { onSelectExpense } = useSelectedExpense();
	const mutation = useDeleteExpense();
	const [dialog, setDialog] = useAtom(deleteExpenseDialogAtom);

	const onDelete = async () => {
		if (!dialog?.data?.id) {
			setDialog({ state: false });
			return;
		}
		await mutation.mutateAsync({ id: dialog.data.id });
		onSelectExpense(null);
		setDialog({ state: false });
	};

	return (
		<DialogPopup className="sm:max-w-[480px]">
			<DialogHeader>
				<DialogTitle>Delete this expense?</DialogTitle>
				<WarningMessage>
					The expense will be deleted and removed from your history. This action cannot be undone.
				</WarningMessage>
			</DialogHeader>
			<DialogFooter>
				<DialogClose render={<Button type="button" variant="secondary" />}>Cancel</DialogClose>
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
						size="icon"
						variant="ghost"
						aria-label="Duplicate this expense"
						onClick={onDuplicate}
					/>
				}
			>
				<CopyPlusIcon className="size-4" />
			</TooltipTrigger>
			<TooltipContent side="bottom">Duplicate</TooltipContent>
		</Tooltip>
	);
}

export function EditExpenseForm(props: { data: SyncedExpense }) {
	const workspace = useWorkspace();
	const mutation = useEditExpense();
	const expenseFilesMutation = useUploadExpenseFiles();
	const filesUploadRef = useRef<FilesCompactUploadRef>(null);
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(workspace.slug));
	const recurringBills = useLiveQueryRecurringBills();

	const walletGroups = wallets.reduce(
		(result, current) => {
			const owner = current.owner;
			// if (!current.isActive) {
			// 	return result;
			// }
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

	const linkedBillId = props.data.recurring_bill_id;
	const linkedBillIsArchived = !!linkedBillId && !recurringBills.some((b) => b.id === linkedBillId);

	const form = useAppForm({
		defaultValues: {
			title: props.data.title ?? "",
			description: props.data.description ?? "",
			date: new Date(props.data.date).toISOString() ?? "",
			transaction: {
				value: props.data.amount ?? 0,
				currency: props.data.currency ?? workspace.metadata.currency,
			},
			walletId: props.data.wallet.id ?? "",
			categoryId: props.data.category?.id ?? "",
			repeat: props.data.repeat ?? "one-time",
			recurringBillId: props.data.recurring_bill_id ?? "",
			attachments: [],
		} as ExpenseFormSchema,
		validators: {
			onSubmit: ExpenseFormSchema,
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				id: props.data.id,
				payload: {
					title: value.title,
					description: value.description,
					amount: value.transaction.value,
					currency: value.transaction.currency,
					date: value.date,
					walletId: value.walletId,
					categoryId: value.categoryId,
					repeat: value.repeat,
					// Pass null to unlink, pass id to link, omit if not changed
					...(value.recurringBillId !== (props.data.recurring_bill_id ?? "")
						? { recurringBillId: value.recurringBillId || null }
						: {}),
				},
			});

			if (value.attachments.length > 0) {
				await expenseFilesMutation.mutateAsync({
					id: props.data.id,
					title: value.title,
					date: value.date,
					files: value.attachments,
				});
				filesUploadRef.current?.clearFiles();
				form.setFieldValue("attachments", []);
			}
		},
	});

	useEffect(() => {
		form.reset();
	}, [props.data.recurring_bill_id, form]);

	return (
		<form.AppForm>
			<form.Form>
				<FieldGroup className="grid grid-cols-1 gap-4 px-4">
					<form.AppField
						name="date"
						children={(field) => <field.DatepickerInputField label="Date" />}
					/>
					<form.AppField
						name="title"
						children={(field) => <field.InputField label="Title" required />}
					/>
					<form.AppField
						name="transaction"
						children={(field) => <field.TransactionAmountField label="Amount" />}
					/>
					<div className="grid grid-cols-2 gap-4">
						<form.AppField
							name="walletId"
							children={(field) => (
								<field.SelectWithGroupsField label="Wallet" groups={walletGroups} />
							)}
						/>
						<form.AppField
							name="categoryId"
							children={(field) => <field.SelectCategoryField label="Category" />}
						/>
					</div>
					<form.Subscribe
						selector={(s) => s.values.repeat}
						children={(repeat) => (
							<div className={repeat === "one-time" ? "" : "grid grid-cols-2 gap-4"}>
								<form.AppField
									name="repeat"
									children={(field) => (
										<field.SelectField label="Repeat" options={AVAILABLE_REPEAT_OPTIONS} />
									)}
								/>
								{repeat !== "one-time" && (
									<div className="flex flex-col gap-1.5">
										<form.AppField
											name="recurringBillId"
											children={(field) => (
												<field.SelectRecurringBillField label="Recurring bill" repeat={repeat} />
											)}
										/>
										{linkedBillIsArchived && (
											<WarningMessage>The linked recurring bill has been archived.</WarningMessage>
										)}
									</div>
								)}
							</div>
						)}
					/>
					<form.AppField
						name="description"
						children={(field) => (
							<field.TiptapField label="Note" defaultValue={props.data.description ?? ""} />
						)}
					/>
				</FieldGroup>

				<FilesCompactUpload
					ref={filesUploadRef}
					onFilesSelectedUpdate={(files) => form.setFieldValue("attachments", files)}
				>
					{(trigger) => (
						<Field
							orientation="horizontal"
							className="bg-card sticky bottom-0 w-full justify-between border-t px-4 py-2"
						>
							{trigger}
							<form.SubscribeButton>Update</form.SubscribeButton>
						</Field>
					)}
				</FilesCompactUpload>
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
	const [value, setValue] = useAtom(searchKeywordsAtom);

	return (
		<div className="relative">
			<Input
				type="search"
				placeholder="Search"
				className="peer ps-6 focus-visible:ring-0"
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
