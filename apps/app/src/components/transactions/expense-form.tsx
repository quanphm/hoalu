import { datetime, toLocalISOString } from "@hoalu/datetime/datetime";
import { CaretDownIcon, CaretUpIcon, RepeatIcon } from "@hoalu/icons/phosphor";
import { XIcon } from "@hoalu/icons/tabler";
import { Button } from "@hoalu/ui/button";
import { useLocalStorage } from "@hoalu/ui/hooks";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { cn } from "@hoalu/ui/utils";
import { useValue } from "@legendapp/state/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, getRouteApi, useNavigate } from "@tanstack/react-router";
import { Suspense, useEffect, useRef } from "react";

import {
	draftExpense$,
	logPayment$,
	makeDraftExpense,
	quickExpenseJobId$,
	scannedReceiptJobId$,
	scannedReceipts$,
} from "#app/atoms/index.ts";
import { useLiveQueryCategories } from "#app/components/categories/use-categories.ts";
import { DeleteExpense, DuplicateExpense } from "#app/components/expenses/expense-actions.tsx";
import { type SyncedExpense } from "#app/components/expenses/use-expenses.ts";
import { Field, FieldControl, FieldMessage } from "#app/components/forms/components.tsx";
import { useAppForm } from "#app/components/forms/index.tsx";
import { useLiveQueryRecurringBills } from "#app/components/recurring-bills/use-recurring-bills.ts";
import {
	TransactionAttachments,
	type TransactionAttachmentsRef,
} from "#app/components/transactions/transaction-attachments.tsx";
import {
	BorderlessTitleInput,
	TransactionCloseAction,
	TransactionPageGrid,
	TransactionPageHeader,
	TransactionSectionLabel,
	type TransactionNavigation,
} from "#app/components/transactions/transaction-layout.tsx";
import { buildWalletGroups, useLiveQueryWallets } from "#app/components/wallets/use-wallets.ts";
import { WarningMessage } from "#app/components/warning-message.tsx";
import { AVAILABLE_REPEAT_OPTIONS } from "#app/helpers/constants.ts";
import { useAuth } from "#app/hooks/use-auth.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { quickExpenseQueue } from "#app/lib/queues/quick-expense-queue.ts";
import { receiptScanQueue } from "#app/lib/queues/receipt-scan-queue.ts";
import { ExpenseFormSchema } from "#app/lib/schema.ts";
import {
	useCreateExpense,
	useDeleteExpenseFile,
	useEditExpense,
	useSetUpRecurringBill,
	useUploadExpenseFiles,
} from "#app/services/mutations.ts";
import { expenseFilesQueryOptions } from "#app/services/query-options.ts";

const routeApi = getRouteApi("/_dashboard/$slug");

export function CreateExpenseForm() {
	const { user } = useAuth();
	const { slug } = routeApi.useParams();
	const navigate = useNavigate();
	const wallets = useLiveQueryWallets();
	const mutation = useCreateExpense();
	const expenseFilesMutation = useUploadExpenseFiles();
	const attachmentsRef = useRef<TransactionAttachmentsRef>(null);

	const draft = useValue(draftExpense$);
	const logPayment = useValue(logPayment$);
	const setLogPayment = logPayment$.set;
	const scannedReceipts = useValue(scannedReceipts$);
	const setScannedReceipts = scannedReceipts$.set;
	const scannedReceiptJobId = useValue(scannedReceiptJobId$);
	const setScannedReceiptJobId = scannedReceiptJobId$.set;
	const quickExpenseJobId = useValue(quickExpenseJobId$);
	const setQuickExpenseJobId = quickExpenseJobId$.set;
	const removeReceiptJob = receiptScanQueue.remove;
	const removeQuickExpenseJob = quickExpenseQueue.remove;

	const [lastUsedWalletId, setLastUsedWalletId] = useLocalStorage<string | null>(
		`last_used_wallet_${slug}`,
		null,
	);
	const [lastUsedCategoryId, setLastUsedCategoryId] = useLocalStorage<string | null>(
		`last_used_category_${slug}`,
		null,
	);

	const categories = useLiveQueryCategories();

	if (!wallets.length) return null;

	const fallbackWallet = {
		label: wallets[0].name,
		value: wallets[0].id,
		currency: wallets[0].currency,
	};
	const walletGroups = buildWalletGroups(wallets, { activeOnly: true });
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
			date: draft.date || toLocalISOString(datetime.format(new Date(), "yyyy-MM-dd")),
			transaction: {
				value: draft.transaction.value,
				currency: draft.transaction.currency || defaultWallet.currency,
			},
			walletId: initialWallet,
			categoryId: initialCategory,
			repeat: draft.repeat,
			recurringBillId: initialRecurringBillId,
			attachments: scannedReceipts.length > 0 ? scannedReceipts : [],
		} as ExpenseFormSchema,
		validators: {
			onSubmit: ExpenseFormSchema,
		},
		listeners: {
			onChange: ({ formApi }) => {
				const { attachments, ...draftValues } = formApi.state.values;
				const isDateDirty = formApi.getFieldMeta("date")?.isDirty ?? false;
				draftExpense$.set({ ...draftValues, date: isDateDirty ? draftValues.date : "" });
			},
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
					eventId: value.eventId,
					recurringBillId:
						value.repeat === "one-time" ? undefined : value.recurringBillId || undefined,
				},
			});

			setLogPayment({ recurringBillId: null });
			setScannedReceipts([]);
			if (scannedReceiptJobId) {
				removeReceiptJob(scannedReceiptJobId);
				setScannedReceiptJobId(null);
			}
			if (quickExpenseJobId) {
				removeQuickExpenseJob(quickExpenseJobId);
				setQuickExpenseJobId(null);
			}
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
				attachmentsRef.current?.clearFiles();
				form.setFieldValue("attachments", []);
			}
			draftExpense$.set(makeDraftExpense());

			navigate({ to: "/$slug/transactions", params: { slug } });
		},
	});

	return (
		<form.AppForm>
			<TransactionPageHeader
				title={
					<form.Subscribe selector={(s) => s.values.title}>
						{(title) => title || "New expense"}
					</form.Subscribe>
				}
				actions={<TransactionCloseAction />}
			/>
			<form.Form>
				<TransactionPageGrid
					main={
						<div className="flex flex-col gap-6">
							<div className="bg-card flex flex-col gap-4 rounded-lg border p-4">
								<form.AppField
									name="title"
									children={(field) => (
										<Field>
											<FieldControl>
												<BorderlessTitleInput
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													placeholder="Untitled expense"
													autoFocus
												/>
											</FieldControl>
											<FieldMessage />
										</Field>
									)}
								/>
								<div className="flex flex-col gap-3 md:flex-row">
									<div className="flex-1">
										<form.AppField
											name="transaction"
											children={(field) => <field.TransactionAmountSplitField sign="expense" />}
										/>
									</div>
									<div className="md:w-[190px]">
										<form.AppField
											name="date"
											children={(field) => <field.DatepickerInputField />}
										/>
									</div>
								</div>
							</div>

							<div className="flex flex-col gap-3">
								<TransactionSectionLabel>Details</TransactionSectionLabel>
								<div className="bg-card grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2">
									<form.AppField
										name="walletId"
										children={(field) => (
											<field.SelectWithGroupsField label="Wallet" groups={walletGroups} />
										)}
									/>
									<form.AppField
										name="categoryId"
										children={(field) => (
											<field.SelectCategoryField label="Category" type="expense" />
										)}
									/>
									<form.AppField
										name="repeat"
										children={(field) => (
											<field.SelectField label="Repeat" options={AVAILABLE_REPEAT_OPTIONS} />
										)}
									/>
									<form.AppField
										name="eventId"
										children={(field) => <field.SelectEventField label="Event" showClosed />}
									/>
								</div>
								<form.Subscribe
									selector={(s) => s.values.repeat}
									children={(repeat) => (
										<div
											className={cn(
												"bg-card rounded-lg border p-4",
												repeat === "one-time" && "hidden",
											)}
										>
											<form.AppField
												name="recurringBillId"
												children={(field) => (
													<field.SelectRecurringBillField label="Recurring bill" repeat={repeat} />
												)}
											/>
										</div>
									)}
								/>
							</div>

							<div className="flex flex-col gap-3">
								<TransactionSectionLabel>Note</TransactionSectionLabel>
								<form.AppField name="description" children={(field) => <field.TiptapField />} />
							</div>

							<div className="flex items-center justify-between">
								<div />
								<div className="flex items-center gap-2">
									<Button
										type="button"
										variant="outline"
										render={<Link to="/$slug/transactions" params={{ slug }} />}
									>
										Cancel
									</Button>
									<form.SubscribeButton>Create expense</form.SubscribeButton>
								</div>
							</div>
						</div>
					}
					aside={
						<TransactionAttachments
							ref={attachmentsRef}
							initialFiles={scannedReceipts}
							onFilesChange={(files) => form.setFieldValue("attachments", files)}
						/>
					}
				/>
			</form.Form>
		</form.AppForm>
	);
}

function SetUpRecurringBillPrompt({ expense }: { expense: SyncedExpense }) {
	const workspace = useWorkspace();
	const mutation = useSetUpRecurringBill();

	return (
		<div className="border-border bg-muted/40 flex items-center gap-3 rounded-lg border px-4 py-2">
			<RepeatIcon className="size-4 shrink-0" />
			<div className="min-w-0 flex-1">
				<p className="text-sm font-medium">Track future payments</p>
				<p className="text-muted-foreground text-sm">
					Link a recurring bill to project upcoming charges.
				</p>
			</div>
			<Button
				variant="outline"
				disabled={mutation.isPending}
				onClick={() =>
					mutation.mutate({
						payload: {
							id: expense.id,
							title: expense.title,
							amount: expense.amount,
							currency: expense.currency,
							repeat: expense.repeat,
							date: expense.date,
							walletId: expense.wallet.id,
							categoryId: expense.category?.id,
							workspaceId: workspace.id,
						},
					})
				}
			>
				{mutation.isPending ? "Setting up…" : "Set up"}
			</Button>
		</div>
	);
}

function EditExpenseAttachments(props: {
	expenseId: string;
	attachmentsRef: React.RefObject<TransactionAttachmentsRef | null>;
	onFilesChange: (files: File[]) => void;
}) {
	const workspace = useWorkspace();
	const { data: files } = useSuspenseQuery(
		expenseFilesQueryOptions(workspace.slug, props.expenseId),
	);
	const deleteMutation = useDeleteExpenseFile();

	return (
		<TransactionAttachments
			ref={props.attachmentsRef}
			existingFiles={files ?? []}
			onDeleteExisting={(fileId) => {
				if (confirm("Delete this attachment?")) {
					deleteMutation.mutate({ expenseId: props.expenseId, fileId });
				}
			}}
			onFilesChange={props.onFilesChange}
		/>
	);
}

export function EditExpenseForm(props: { data: SyncedExpense; navigation: TransactionNavigation }) {
	const workspace = useWorkspace();
	const mutation = useEditExpense();
	const expenseFilesMutation = useUploadExpenseFiles();
	const attachmentsRef = useRef<TransactionAttachmentsRef>(null);
	const wallets = useLiveQueryWallets();
	const recurringBills = useLiveQueryRecurringBills();

	const walletGroups = buildWalletGroups(wallets);

	const linkedBillId = props.data.recurring_bill_id;
	const linkedBillIsArchived = !!linkedBillId && !recurringBills.some((b) => b.id === linkedBillId);

	const form = useAppForm({
		defaultValues: {
			title: props.data.title ?? "",
			description: props.data.description ?? "",
			date: toLocalISOString(datetime.format(new Date(props.data.date), "yyyy-MM-dd")),
			transaction: {
				value: props.data.amount ?? 0,
				currency: props.data.currency ?? workspace.metadata.currency,
			},
			walletId: props.data.wallet.id ?? "",
			categoryId: props.data.category?.id ?? "",
			repeat: props.data.repeat ?? "one-time",
			recurringBillId: props.data.recurring_bill_id ?? "",
			eventId: props.data.event_id ?? "",
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
					recurringBillId: value.repeat === "one-time" ? null : value.recurringBillId || null,
					eventId: value.eventId || null,
				},
			});

			if (value.attachments.length > 0) {
				await expenseFilesMutation.mutateAsync({
					id: props.data.id,
					title: value.title,
					date: value.date,
					files: value.attachments,
				});
				attachmentsRef.current?.clearFiles();
			}
			form.reset({ ...value, attachments: [] });
		},
	});

	useEffect(() => {
		form.reset();
	}, [props.data.recurring_bill_id, form]);

	const { onClose, onGoUp, onGoDown, canGoUp, canGoDown } = props.navigation;

	return (
		<form.AppForm>
			<TransactionPageHeader
				title={
					<form.Subscribe selector={(s) => s.values.title}>
						{(title) => title || "Untitled expense"}
					</form.Subscribe>
				}
				actions={
					<>
						<Tooltip>
							<TooltipTrigger
								render={
									<Button
										size="icon-sm"
										variant="outline"
										onClick={onGoDown}
										disabled={!canGoDown}
									/>
								}
							>
								<CaretDownIcon />
							</TooltipTrigger>
							<TooltipContent side="bottom">Down (J)</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger
								render={
									<Button size="icon-sm" variant="outline" onClick={onGoUp} disabled={!canGoUp} />
								}
							>
								<CaretUpIcon />
							</TooltipTrigger>
							<TooltipContent side="bottom">Up (K)</TooltipContent>
						</Tooltip>
						<DuplicateExpense data={props.data} />
						<DeleteExpense id={props.data.id} />
						<Tooltip>
							<TooltipTrigger
								render={<Button size="icon-sm" variant="outline" onClick={onClose} />}
							>
								<XIcon />
							</TooltipTrigger>
							<TooltipContent side="bottom">Close</TooltipContent>
						</Tooltip>
					</>
				}
			/>
			<form.Form>
				<TransactionPageGrid
					main={
						<div className="flex flex-col gap-6">
							{props.data.repeat !== "one-time" && !props.data.recurring_bill_id && (
								<SetUpRecurringBillPrompt expense={props.data} />
							)}
							<div className="bg-card flex flex-col gap-4 rounded-lg border p-4">
								<form.AppField
									name="title"
									children={(field) => (
										<Field>
											<FieldControl>
												<BorderlessTitleInput
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													placeholder="Untitled expense"
												/>
											</FieldControl>
											<FieldMessage />
										</Field>
									)}
								/>
								<div className="flex flex-col gap-3 md:flex-row">
									<div className="flex-1">
										<form.AppField
											name="transaction"
											children={(field) => <field.TransactionAmountSplitField sign="expense" />}
										/>
									</div>
									<div className="md:w-[190px]">
										<form.AppField
											name="date"
											children={(field) => <field.DatepickerInputField />}
										/>
									</div>
								</div>
							</div>

							<div className="flex flex-col gap-3">
								<TransactionSectionLabel>Details</TransactionSectionLabel>
								<div className="bg-card grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2">
									<form.AppField
										name="walletId"
										children={(field) => (
											<field.SelectWithGroupsField label="Wallet" groups={walletGroups} />
										)}
									/>
									<form.AppField
										name="categoryId"
										children={(field) => (
											<field.SelectCategoryField label="Category" type="expense" />
										)}
									/>
									<form.AppField
										name="repeat"
										children={(field) => (
											<field.SelectField label="Repeat" options={AVAILABLE_REPEAT_OPTIONS} />
										)}
									/>
									<form.AppField
										name="eventId"
										children={(field) => <field.SelectEventField label="Event" showClosed />}
									/>
								</div>
								<form.Subscribe
									selector={(s) => s.values.repeat}
									children={(repeat) => (
										<div
											className={cn(
												"bg-card flex flex-col gap-3 rounded-lg border p-4",
												repeat === "one-time" && "hidden",
											)}
										>
											<form.AppField
												name="recurringBillId"
												children={(field) => (
													<field.SelectRecurringBillField label="Recurring bill" repeat={repeat} />
												)}
											/>
											{linkedBillIsArchived && (
												<WarningMessage>
													The linked recurring bill has been archived.
												</WarningMessage>
											)}
										</div>
									)}
								/>
							</div>

							<div className="flex flex-col gap-3">
								<TransactionSectionLabel>Note</TransactionSectionLabel>
								<form.AppField name="description" children={(field) => <field.TiptapField />} />
							</div>

							<div className="flex items-center justify-between">
								<div className="text-muted-foreground text-sm">
									<form.Subscribe selector={(s) => s.isDirty}>
										{(isDirty) => (isDirty ? "Unsaved changes" : "")}
									</form.Subscribe>
								</div>
								<div className="flex items-center gap-2">
									<Button type="button" variant="outline" onClick={() => form.reset()}>
										Cancel
									</Button>
									<form.SubscribeButton>Update</form.SubscribeButton>
								</div>
							</div>
						</div>
					}
					aside={
						<Suspense
							fallback={
								<TransactionAttachments
									onFilesChange={(files) => form.setFieldValue("attachments", files)}
								/>
							}
						>
							<EditExpenseAttachments
								expenseId={props.data.id}
								attachmentsRef={attachmentsRef}
								onFilesChange={(files) => form.setFieldValue("attachments", files)}
							/>
						</Suspense>
					}
				/>
			</form.Form>
		</form.AppForm>
	);
}
