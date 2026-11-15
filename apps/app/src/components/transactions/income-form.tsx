import { datetime, toLocalISOString } from "@hoalu/datetime/datetime";
import { CaretDownIcon, CaretUpIcon } from "@hoalu/icons/phosphor";
import { Button } from "@hoalu/ui/button";
import { useLocalStorage } from "@hoalu/ui/hooks";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { useValue } from "@legendapp/state/react";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useId, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { draftIncome$, makeDraftIncome } from "#app/atoms/index.ts";
import { Field, FieldControl, FieldMessage } from "#app/components/forms/components.tsx";
import { useAppForm } from "#app/components/forms/index.tsx";
import { DeleteIncome, DuplicateIncome } from "#app/components/incomes/income-actions.tsx";
import { type SyncedIncome } from "#app/components/incomes/use-incomes.ts";
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
import { KEYBOARD_SHORTCUTS } from "#app/helpers/constants.ts";
import { useAuth } from "#app/hooks/use-auth.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { IncomeFormSchema } from "#app/lib/schema.ts";
import { useCreateIncome, useEditIncome } from "#app/services/mutations.ts";

const routeApi = getRouteApi("/_dashboard/$slug");
const createRouteApi = getRouteApi("/_dashboard/$slug/_toolbar-and-queue/transactions/new");

export function CreateIncomeForm() {
	const workspace = useWorkspace();
	const { user } = useAuth();
	const { slug } = routeApi.useParams();
	const navigate = useNavigate();
	const wallets = useLiveQueryWallets();
	const mutation = useCreateIncome();
	const returned = createRouteApi.useSearch();
	const draft = useValue(draftIncome$);
	const submittedRef = useRef(false);
	const formId = useId();
	const amountId = useId();

	const [lastUsedWalletId, setLastUsedWalletId] = useLocalStorage<string | null>(
		`last_used_income_wallet_${slug}`,
		null,
	);
	const [lastUsedCategoryId, setLastUsedCategoryId] = useLocalStorage<string | null>(
		`last_used_income_category_${slug}`,
		null,
	);

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

	const initialWallet = draft.walletId || validLastWallet || defaultWallet.value;
	// A create page hands its result back through the URL, which outranks the draft.
	const initialCategory = returned.categoryId || draft.categoryId || lastUsedCategoryId;

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
		} as IncomeFormSchema,
		validators: {
			onSubmit: IncomeFormSchema,
		},
		listeners: {
			onChange: ({ formApi }) => {
				const isDateDirty = formApi.getFieldMeta("date")?.isDirty ?? false;
				draftIncome$.set({
					...formApi.state.values,
					date: isDateDirty ? formApi.state.values.date : "",
				});
			},
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				payload: {
					title: value.title,
					description: value.description,
					amount: value.transaction.value,
					currency: value.transaction.currency,
					date: value.date,
					walletId: value.walletId,
					categoryId: value.categoryId,
				},
			});
			submittedRef.current = true;
			setLastUsedWalletId(value.walletId);
			if (value.categoryId) {
				setLastUsedCategoryId(value.categoryId);
			}
			draftIncome$.set(makeDraftIncome());
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
		draftIncome$.set(makeDraftIncome());
		form.reset({
			title: "",
			description: "",
			date: toLocalISOString(datetime.format(new Date(), "yyyy-MM-dd")),
			transaction: { value: 0, currency: defaultWallet.currency },
			walletId: validLastWallet || defaultWallet.value,
			categoryId: returned.categoryId || lastUsedCategoryId || "",
		});
	}

	if (!wallets.length) return null;

	return (
		<form.AppForm>
			<TransactionPageHeader
				title={
					<form.Subscribe selector={(s) => s.values.title}>
						{(title) => title || "New income"}
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
													placeholder="Untitled income"
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
											sign="income"
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
											type="income"
											createAction="navigate"
										/>
									)}
								/>
								<form.AppField name="date" children={(dateField) => <dateField.DateChipField />} />
							</TransactionMetaRow>

							<TransactionPanel>
								<form.AppField
									name="description"
									children={(field) => <field.TiptapField label="Note" />}
								/>
							</TransactionPanel>

							<TransactionSubmitRow>
								<TransactionResetButton onClick={resetDraft} />
								<form.SubscribeButton>Create income</form.SubscribeButton>
							</TransactionSubmitRow>
						</div>
					}
				/>
			</form.Form>
		</form.AppForm>
	);
}

export function EditIncomeForm(props: { data: SyncedIncome; navigation: TransactionNavigation }) {
	const workspace = useWorkspace();
	const mutation = useEditIncome();
	const wallets = useLiveQueryWallets();
	const formId = useId();
	const amountId = useId();

	const walletGroups = buildWalletGroups(wallets);

	const form = useAppForm({
		defaultValues: {
			title: props.data.title,
			description: props.data.description ?? "",
			date: toLocalISOString(datetime.format(new Date(props.data.date), "yyyy-MM-dd")),
			transaction: {
				value: props.data.amount ?? 0,
				currency: props.data.currency ?? workspace.metadata.currency,
			},
			walletId: props.data.wallet.id,
			categoryId: props.data.category?.id ?? "",
		} as IncomeFormSchema,
		validators: {
			onSubmit: IncomeFormSchema,
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
				},
			});
			form.reset(value);
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

	const { onClose, onGoUp, onGoDown, canGoUp, canGoDown } = props.navigation;

	return (
		<form.AppForm>
			<TransactionPageHeader
				title={
					<form.Subscribe selector={(s) => s.values.title}>
						{(title) => title || "Untitled income"}
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
						<DuplicateIncome data={props.data} />
						<DeleteIncome id={props.data.id} />
						<TransactionCloseAction onClose={onClose} />
					</>
				}
			/>
			<form.Form id={formId}>
				<TransactionPageGrid
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
													placeholder="Untitled income"
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
											sign="income"
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
										<categoryField.SelectCategoryField placeholder="Category" type="income" />
									)}
								/>
								<form.AppField name="date" children={(dateField) => <dateField.DateChipField />} />
							</TransactionMetaRow>

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
					}
				/>
			</form.Form>
		</form.AppForm>
	);
}
