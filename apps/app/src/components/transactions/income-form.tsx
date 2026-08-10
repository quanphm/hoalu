import { CaretDownIcon, CaretUpIcon } from "@hoalu/icons/phosphor";
import { XIcon } from "@hoalu/icons/tabler";
import { Button } from "@hoalu/ui/button";
import { useLocalStorage } from "@hoalu/ui/hooks";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { useValue } from "@legendapp/state/react";
import { Link, getRouteApi, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";

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
	TransactionSectionLabel,
	type TransactionNavigation,
} from "#app/components/transactions/transaction-layout.tsx";
import { buildWalletGroups, useLiveQueryWallets } from "#app/components/wallets/use-wallets.ts";
import { useAuth } from "#app/hooks/use-auth.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { IncomeFormSchema } from "#app/lib/schema.ts";
import { useCreateIncome, useEditIncome } from "#app/services/mutations.ts";

const routeApi = getRouteApi("/_dashboard/$slug");

export function CreateIncomeForm() {
	const { user } = useAuth();
	const { slug } = routeApi.useParams();
	const navigate = useNavigate();
	const wallets = useLiveQueryWallets();
	const mutation = useCreateIncome();
	const draft = useValue(draftIncome$);
	const submittedRef = useRef(false);

	const [lastUsedWalletId, setLastUsedWalletId] = useLocalStorage<string | null>(
		`last_used_income_wallet_${slug}`,
		null,
	);
	const [lastUsedCategoryId, setLastUsedCategoryId] = useLocalStorage<string | null>(
		`last_used_income_category_${slug}`,
		null,
	);

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

	const initialWallet = draft.walletId || validLastWallet || defaultWallet.value;
	const initialCategory = draft.categoryId || lastUsedCategoryId;

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
													placeholder="Untitled income"
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
											children={(field) => <field.TransactionAmountSplitField sign="income" />}
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
											<field.SelectCategoryField label="Category" type="income" />
										)}
									/>
								</div>
							</div>

							<div className="flex flex-col gap-3">
								<TransactionSectionLabel>Note</TransactionSectionLabel>
								<form.AppField name="description" children={(field) => <field.TiptapField />} />
							</div>

							<div className="flex items-center justify-between">
								<div />
								<div className="flex items-center gap-2">
									{/* <Button
										type="button"
										variant="outline"
										render={<Link to="/$slug/transactions" params={{ slug }} />}
									>
										Cancel
									</Button> */}
									<form.SubscribeButton>Create income</form.SubscribeButton>
								</div>
							</div>
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

	const walletGroups = buildWalletGroups(wallets);

	const form = useAppForm({
		defaultValues: {
			title: props.data.title,
			description: props.data.description ?? "",
			date: new Date(props.data.date).toISOString(),
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
													placeholder="Untitled income"
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
											children={(field) => <field.TransactionAmountSplitField sign="income" />}
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
											<field.SelectCategoryField label="Category" type="income" />
										)}
									/>
								</div>
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
									{/* <Button type="button" variant="outline" onClick={() => form.reset()}>
										Cancel
									</Button> */}
									<form.SubscribeButton>Update</form.SubscribeButton>
								</div>
							</div>
						</div>
					}
				/>
			</form.Form>
		</form.AppForm>
	);
}
