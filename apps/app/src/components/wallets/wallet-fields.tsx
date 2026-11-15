import { useId } from "react";

import { Field, FieldControl, FieldMessage } from "#app/components/forms/components.tsx";
import { withForm } from "#app/components/forms/index.tsx";
import { PillPicker, type PillOption } from "#app/components/forms/pill-picker.tsx";
import { Chip } from "#app/components/forms/pill.tsx";
import {
	BorderlessTitleInput,
	TransactionPageGrid,
	TransactionSubmitRow,
} from "#app/components/transactions/transaction-layout.tsx";
import {
	TransactionMetaRow,
	TransactionPanel,
} from "#app/components/transactions/transaction-meta.tsx";
import { WalletIcon } from "#app/components/wallets/wallet-actions.tsx";
import {
	AVAILABLE_CURRENCY_OPTIONS,
	AVAILABLE_WALLET_TYPE_OPTIONS,
} from "#app/helpers/constants.ts";

import type { WalletFormValues } from "#app/components/wallets/wallet-form.ts";
import type { WalletTypeSchema } from "@hoalu/schema/schema";

const BLANK_WALLET: WalletFormValues = {
	name: "",
	description: "",
	currency: "USD",
	type: "cash",
	isActive: true,
	ownerId: undefined,
};

const TYPE_OPTIONS: PillOption<WalletTypeSchema>[] = AVAILABLE_WALLET_TYPE_OPTIONS.map(
	(option) => ({
		value: option.value,
		label: option.label,
		icon: <WalletIcon type={option.value} />,
	}),
);

/**
 * A wallet holds no figure of its own — its balance is derived from what was spent — so the card
 * is a name, the attributes that decide how it behaves, and a description. Same shape as the
 * transaction and bill forms, with the amount line simply absent.
 */
export const WalletFields = withForm({
	defaultValues: BLANK_WALLET,
	props: {} as {
		formId: string;
		submitLabel: string;
		/** Create has no baseline to be dirty against, so only edit shows the note. */
		showDirty?: boolean;
		/** Owners can only be reassigned between members; a solo workspace has no choice to offer. */
		owners?: { label: string; value: string }[];
		/** The edit page can retire a wallet; a new one is always usable. */
		showStatus?: boolean;
	},
	render: ({ form, formId, submitLabel, showDirty, owners, showStatus }) => {
		const nameId = useId();

		return (
			<form.Form id={formId}>
				<TransactionPageGrid
					keepAsideColumn
					main={
						<div className="bg-card flex flex-col gap-4 rounded-lg border p-4">
							<form.AppField
								name="name"
								validators={{
									onSubmit: ({ value }) =>
										value.trim() ? undefined : { message: "Give this wallet a name" },
								}}
								children={(field) => (
									<Field>
										<FieldControl>
											<BorderlessTitleInput
												id={nameId}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												onKeyDown={(e) => {
													if (e.key !== "Enter") return;
													e.preventDefault();
													void form.handleSubmit();
												}}
												placeholder="Untitled wallet"
												aria-label="Wallet name"
												autoFocus
											/>
										</FieldControl>
										<FieldMessage />
									</Field>
								)}
							/>

							<TransactionMetaRow>
								<form.AppField name="type">
									{(typeField) => (
										<PillPicker
											options={TYPE_OPTIONS}
											value={typeField.state.value}
											onValueChange={typeField.handleChange}
											placeholder="Type"
											searchable={false}
										/>
									)}
								</form.AppField>
								<form.AppField name="currency">
									{(currencyField) => (
										<PillPicker
											options={AVAILABLE_CURRENCY_OPTIONS}
											value={currencyField.state.value}
											onValueChange={currencyField.handleChange}
											placeholder="Currency"
											searchable={false}
											popupClassName="w-40"
										/>
									)}
								</form.AppField>
								{owners && owners.length > 1 && (
									<form.AppField name="ownerId">
										{(ownerField) => (
											<PillPicker
												options={owners}
												value={ownerField.state.value}
												onValueChange={ownerField.handleChange}
												placeholder="Owner"
												searchPlaceholder="Search members…"
												popupClassName="w-56"
											/>
										)}
									</form.AppField>
								)}
								{showStatus && (
									<form.AppField name="isActive">
										{(activeField) => {
											const isActive = activeField.state.value !== false;
											return (
												<Chip
													active={isActive}
													onClick={() => activeField.handleChange(!isActive)}
													title={
														isActive
															? "Wallet is usable for new entries"
															: "No new expense can use this wallet"
													}
												>
													<span
														aria-hidden="true"
														className={`size-2 shrink-0 rounded-full ${isActive ? "bg-success" : "bg-muted-foreground"}`}
													/>
													{isActive ? "In use" : "Not in use"}
												</Chip>
											);
										}}
									</form.AppField>
								)}
							</TransactionMetaRow>

							<TransactionPanel>
								<form.AppField
									name="description"
									children={(field) => (
										<field.InputField
											label="Description"
											placeholder="Physical wallet"
											autoComplete="off"
										/>
									)}
								/>
							</TransactionPanel>

							<TransactionSubmitRow
								status={
									showDirty ? (
										<form.Subscribe selector={(s) => s.isDirty}>
											{(isDirty) => (isDirty ? "Unsaved changes" : null)}
										</form.Subscribe>
									) : null
								}
							>
								<form.SubscribeButton>{submitLabel}</form.SubscribeButton>
							</TransactionSubmitRow>
						</div>
					}
				/>
			</form.Form>
		);
	},
});
