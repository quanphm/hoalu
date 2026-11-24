import { datetime, toLocalISOString } from "@hoalu/datetime/datetime";
import { CaretDownIcon, CaretUpIcon, RepeatIcon } from "@hoalu/icons/phosphor";
import { Button } from "@hoalu/ui/button";
import { useLocalStorage } from "@hoalu/ui/hooks";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { useValue } from "@legendapp/state/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { Suspense, useEffect, useId, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";

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
import { PillPicker } from "#app/components/forms/pill-picker.tsx";
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
	TransactionResetButton,
	TransactionSubmitRow,
	type TransactionNavigation,
} from "#app/components/transactions/transaction-layout.tsx";
import {
	TransactionMetaRow,
	TransactionPanel,
} from "#app/components/transactions/transaction-meta.tsx";
import { buildWalletGroups, useLiveQueryWallets } from "#app/components/wallets/use-wallets.ts";
import { WarningMessage } from "#app/components/warning-message.tsx";
import { AVAILABLE_REPEAT_OPTIONS, KEYBOARD_SHORTCUTS } from "#app/helpers/constants.ts";
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
const createRouteApi = getRouteApi("/_dashboard/$slug/_toolbar-and-queue/transactions/new");

export function CreateExpenseForm() {
	const workspace = useWorkspace();
	const { user } = useAuth();
	const { slug } = routeApi.useParams();
	const returned = createRouteApi.useSearch();
	const navigate = useNavigate();
	const wallets = useLiveQueryWallets();
	const mutation = useCreateExpense();
	const expenseFilesMutation = useUploadExpenseFiles();
	const attachmentsRef = useRef<TransactionAttachmentsRef>(null);
	const formId = useId();
	const amountId = useId();

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

	// A new workspace can render this page before its default wallet syncs in, so the defaults
	// have to survive an empty list: the guard below the hooks then renders nothing.
	const fallbackWallet = {
		label: wallets[0]?.name ?? "",
		value: wallets[0]?.id ?? "",
		currency: wallets[0]?.currency ?? workspace.metadata.currency,
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

	const recurringBills = useLiveQueryRecurringBills();
	const returnedBill = returned.recurringBillId
		? recurringBills.find((bill) => bill.id === returned.recurringBillId)
		: undefined;

	const initialWallet = draft.walletId || validLastWallet || defaultWallet.value;
	// A create page hands its result back through the URL, which outranks the draft: the choice
	// made two seconds ago is newer than the one saved earlier.
	const initialCategory = returned.categoryId || draft.categoryId || validLastCategory;
	const initialEventId = returned.eventId || draft.eventId || undefined;
	const initialRecurringBillId =
		returned.recurringBillId || logPayment.recurringBillId || draft.recurringBillId || undefined;
	// The bill picker only lists bills of the current cadence, so a bill created on its own page
	// has to bring its cadence back with it or the pill would show nothing.
	const initialRepeat = returnedBill?.repeat ?? draft.repeat;

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
			repeat: initialRepeat,
			eventId: initialEventId,
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
					title: value.title,
					date: value.date,
					files: value.attachments,
				});
				attachmentsRef.current?.clearFiles();
				form.setFieldValue("attachments", []);
			}
			draftExpense$.set(makeDraftExpense());

			navigate({ to: "/$slug/transactions", params: { slug } });
		},
	});

	useHotkeys(
		KEYBOARD_SHORTCUTS.save_transaction.hotkey,
		(e) => {
			e.preventDefault();
			void form.handleSubmit();
		},
		{ enableOnFormTags: true },
		[form],
	);

	// Clears what the draft contributed without touching the URL's round-trip params, so resetting
	// lands on the same page a fresh visit would open.
	function resetDraft() {
		attachmentsRef.current?.clearFiles();
		setScannedReceipts([]);
		if (scannedReceiptJobId) {
			removeReceiptJob(scannedReceiptJobId);
			setScannedReceiptJobId(null);
		}
		setLogPayment({ recurringBillId: null });
		draftExpense$.set(makeDraftExpense());
		form.reset({
			title: "",
			description: "",
			date: toLocalISOString(datetime.format(new Date(), "yyyy-MM-dd")),
			transaction: { value: 0, currency: defaultWallet.currency },
			walletId: validLastWallet || defaultWallet.value,
			categoryId: returned.categoryId || validLastCategory || "",
			repeat: returnedBill?.repeat ?? "one-time",
			recurringBillId: returned.recurringBillId || undefined,
			eventId: returned.eventId || undefined,
			attachments: [],
		});
	}

	if (!wallets.length) return null;

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
			<form.Form id={formId}>
				<TransactionPageGrid
					keepAsideColumn
					main={
						<div className="bg-card flex flex-col gap-4 rounded-lg border p-4">
							<div className="flex flex-col gap-1">
								<form.AppField
									name="title"
									validators={{
										onSubmit: ({ value }) =>
											value.trim() ? undefined : { message: "Give this transaction a title" },
									}}
									children={(field) => (
										<Field>
											<FieldControl>
												<BorderlessTitleInput
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													onKeyDown={(e) => {
														if (e.key !== "Enter") return;
														e.preventDefault();
														document.getElementById(amountId)?.focus();
													}}
													placeholder="Untitled expense"
													autoFocus
												/>
											</FieldControl>
											<FieldMessage />
										</Field>
									)}
								/>
								<form.AppField
									name="transaction"
									children={(field) => (
										<field.TransactionAmountHeroField
											inputId={amountId}
											sign="expense"
											onEnter={() => void form.handleSubmit()}
										/>
									)}
								/>
							</div>

							<TransactionMetaRow>
								<form.AppField
									name="walletId"
									children={(walletField) => (
										<walletField.SelectWithGroupsField placeholder="Wallet" groups={walletGroups} />
									)}
								/>
								<form.AppField
									name="categoryId"
									validators={{
										onSubmit: ({ value }) => (value ? undefined : { message: "Pick a category" }),
									}}
									children={(categoryField) => (
										<categoryField.SelectCategoryField
											placeholder="Category"
											type="expense"
											createAction="navigate"
										/>
									)}
								/>
								<form.AppField name="date" children={(dateField) => <dateField.DateChipField />} />
								<form.AppField name="repeat">
									{(repeatField) => (
										<PillPicker
											options={AVAILABLE_REPEAT_OPTIONS}
											value={repeatField.state.value}
											onValueChange={repeatField.handleChange}
											placeholder="Repeat"
											triggerIcon={<RepeatIcon className="size-3.5" aria-hidden="true" />}
											searchable={false}
										/>
									)}
								</form.AppField>
								<form.Subscribe selector={(s) => s.values.repeat}>
									{(repeat) =>
										repeat !== "one-time" ? (
											<form.AppField
												name="recurringBillId"
												children={(billField) => (
													<billField.SelectRecurringBillField
														placeholder="Recurring bill"
														repeat={repeat}
														createAction="navigate"
													/>
												)}
											/>
										) : null
									}
								</form.Subscribe>
								<form.AppField
									name="eventId"
									children={(eventField) => (
										<eventField.SelectEventField
											placeholder="No event"
											showClosed
											createAction="navigate"
											transactionType="expense"
										/>
									)}
								/>
							</TransactionMetaRow>

							<TransactionPanel>
								<form.AppField
									name="description"
									children={(field) => <field.TiptapField label="Note" />}
								/>
							</TransactionPanel>

							<TransactionSubmitRow>
								<TransactionResetButton onClick={resetDraft} />
								<form.SubscribeButton>Create expense</form.SubscribeButton>
							</TransactionSubmitRow>
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
							amount: expense.realAmount,
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
	const formId = useId();
	const amountId = useId();

	const walletGroups = buildWalletGroups(wallets);

	const linkedBillId = props.data.recurring_bill_id;
	const linkedBillIsArchived = !!linkedBillId && !recurringBills.some((b) => b.id === linkedBillId);

	const form = useAppForm({
		defaultValues: {
			title: props.data.title ?? "",
			description: props.data.description ?? "",
			date: toLocalISOString(datetime.format(new Date(props.data.date), "yyyy-MM-dd")),
			transaction: {
				value: props.data.realAmount ?? 0,
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

	useHotkeys(
		KEYBOARD_SHORTCUTS.save_transaction.hotkey,
		(e) => {
			e.preventDefault();
			void form.handleSubmit();
		},
		{ enableOnFormTags: true },
		[form],
	);

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
						<TransactionCloseAction onClose={onClose} />
					</>
				}
			/>
			<form.Form id={formId}>
				<TransactionPageGrid
					main={
						<div className="flex flex-col gap-6">
							{props.data.repeat !== "one-time" && !props.data.recurring_bill_id && (
								<SetUpRecurringBillPrompt expense={props.data} />
							)}
							<div className="bg-card flex flex-col gap-4 rounded-lg border p-4">
								<div className="flex flex-col gap-1">
									<form.AppField
										name="title"
										validators={{
											onSubmit: ({ value }) =>
												value.trim() ? undefined : { message: "Give this transaction a title" },
										}}
										children={(field) => (
											<Field>
												<FieldControl>
													<BorderlessTitleInput
														name={field.name}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														onKeyDown={(e) => {
															if (e.key !== "Enter") return;
															e.preventDefault();
															document.getElementById(amountId)?.focus();
														}}
														placeholder="Untitled expense"
													/>
												</FieldControl>
												<FieldMessage />
											</Field>
										)}
									/>
									<form.AppField
										name="transaction"
										children={(field) => (
											<field.TransactionAmountHeroField
												inputId={amountId}
												sign="expense"
												onEnter={() => void form.handleSubmit()}
											/>
										)}
									/>
								</div>

								<TransactionMetaRow>
									<form.AppField
										name="walletId"
										children={(walletField) => (
											<walletField.SelectWithGroupsField
												placeholder="Wallet"
												groups={walletGroups}
											/>
										)}
									/>
									<form.AppField
										name="categoryId"
										validators={{
											onSubmit: ({ value }) => (value ? undefined : { message: "Pick a category" }),
										}}
										children={(categoryField) => (
											<categoryField.SelectCategoryField placeholder="Category" type="expense" />
										)}
									/>
									<form.AppField
										name="date"
										children={(dateField) => <dateField.DateChipField />}
									/>
									<form.AppField name="repeat">
										{(repeatField) => (
											<PillPicker
												options={AVAILABLE_REPEAT_OPTIONS}
												value={repeatField.state.value}
												onValueChange={repeatField.handleChange}
												placeholder="Repeat"
												triggerIcon={<RepeatIcon className="size-3.5" aria-hidden="true" />}
												searchable={false}
											/>
										)}
									</form.AppField>
									<form.Subscribe selector={(s) => s.values.repeat}>
										{(repeat) =>
											repeat !== "one-time" ? (
												<form.AppField
													name="recurringBillId"
													children={(billField) => (
														<billField.SelectRecurringBillField
															placeholder="Recurring bill"
															repeat={repeat}
														/>
													)}
												/>
											) : null
										}
									</form.Subscribe>
									<form.AppField
										name="eventId"
										children={(eventField) => (
											<eventField.SelectEventField placeholder="No event" showClosed />
										)}
									/>
								</TransactionMetaRow>

								{linkedBillIsArchived && (
									<div className="mt-1">
										<WarningMessage>The linked recurring bill has been archived.</WarningMessage>
									</div>
								)}

								<TransactionPanel>
									<form.AppField
										name="description"
										children={(field) => <field.TiptapField label="Note" />}
									/>
								</TransactionPanel>

								<TransactionSubmitRow
									status={
										<form.Subscribe selector={(s) => s.isDirty}>
											{(isDirty) => (isDirty ? "Unsaved changes" : null)}
										</form.Subscribe>
									}
								>
									<form.SubscribeButton>Update</form.SubscribeButton>
								</TransactionSubmitRow>
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
