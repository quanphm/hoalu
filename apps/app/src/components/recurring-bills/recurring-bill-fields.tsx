import { CalendarBlankIcon, RepeatIcon } from "@hoalu/icons/phosphor";
import { useId } from "react";

import { Field, FieldControl, FieldMessage } from "#app/components/forms/components.tsx";
import { withForm } from "#app/components/forms/index.tsx";
import { PillPicker } from "#app/components/forms/pill-picker.tsx";
import {
	type BillFormSchema,
	CADENCE_OPTIONS,
	DAY_OF_MONTH_OPTIONS,
	DOW_OPTIONS,
} from "#app/components/recurring-bills/recurring-bill-form.ts";
import {
	BorderlessTitleInput,
	TransactionPageGrid,
	TransactionSubmitRow,
} from "#app/components/transactions/transaction-layout.tsx";
import {
	TransactionMetaRow,
	TransactionPanel,
} from "#app/components/transactions/transaction-meta.tsx";

import type { WalletGroups } from "#app/components/wallets/use-wallets.ts";

const BLANK_BILL: BillFormSchema = {
	title: "",
	description: "",
	dueDay: "1",
	anchorDate: "",
	transaction: { value: 0, currency: "USD" },
	walletId: "",
	categoryId: "",
	eventId: "",
	repeat: "monthly",
};

/**
 * The bill's definition, in the shape the transaction form established: a title, one
 * display-scale amount, a row of pills carrying cadence and due date, then the note. Create and
 * edit render this same block, so a bill cannot look like two different objects in two places.
 */
export const RecurringBillFields = withForm({
	defaultValues: BLANK_BILL,
	props: {
		formId: "recurring-bill-form",
		walletGroups: {} as WalletGroups,
		defaultDueDay: new Date().getDate(),
	},
	render: ({ form, formId, submitLabel, showDirty, walletGroups, defaultDueDay }) => {
		const amountId = useId();

		return (
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
											value.trim() ? undefined : { message: "Give this bill a name" },
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
													placeholder="Untitled bill"
													aria-label="Recurring bill title"
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
								<form.AppField name="repeat">
									{(repeatField) => (
										<PillPicker
											options={CADENCE_OPTIONS}
											value={repeatField.state.value}
											onValueChange={(next) => {
												repeatField.handleChange(next);
												const due = form.getFieldValue("dueDay");
												if (next === "weekly" && Number(due) > 6) {
													form.setFieldValue("dueDay", "1");
												}
												if (next === "monthly" && Number(due) < 1) {
													form.setFieldValue("dueDay", String(defaultDueDay));
												}
											}}
											placeholder="Repeat"
											triggerIcon={<RepeatIcon className="size-3.5" aria-hidden="true" />}
											searchable={false}
										/>
									)}
								</form.AppField>
								<form.Subscribe selector={(s) => s.values.repeat}>
									{(repeat) =>
										repeat === "yearly" ? (
											<form.AppField
												name="anchorDate"
												children={(field) => <field.DateChipField relative={false} />}
											/>
										) : (
											<form.AppField name="dueDay">
												{(dueField) => (
													<PillPicker
														options={repeat === "weekly" ? DOW_OPTIONS : DAY_OF_MONTH_OPTIONS}
														value={dueField.state.value}
														onValueChange={dueField.handleChange}
														placeholder="Due"
														triggerIcon={
															<CalendarBlankIcon className="size-3.5" aria-hidden="true" />
														}
														searchable={repeat === "monthly"}
														searchPlaceholder="Search days…"
														popupClassName="w-48"
													/>
												)}
											</form.AppField>
										)
									}
								</form.Subscribe>
								<form.AppField
									name="walletId"
									children={(field) => (
										<field.SelectWithGroupsField placeholder="Wallet" groups={walletGroups} />
									)}
								/>
								<form.AppField
									name="categoryId"
									children={(field) => (
										<field.SelectCategoryField placeholder="Category" type="expense" />
									)}
								/>
								<form.AppField
									name="eventId"
									children={(field) => <field.SelectEventField placeholder="No event" showClosed />}
								/>
							</TransactionMetaRow>

							<TransactionPanel>
								<form.AppField
									name="description"
									children={(field) => <field.TiptapField label="Note" />}
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
