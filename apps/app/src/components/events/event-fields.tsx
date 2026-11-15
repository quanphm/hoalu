import { useId } from "react";

import { EVENT_STATUS_OPTIONS, type EventFormSchema } from "#app/components/events/event-form.ts";
import { Field, FieldControl, FieldMessage } from "#app/components/forms/components.tsx";
import { DateRangeChip } from "#app/components/forms/date-range-chip.tsx";
import { withForm } from "#app/components/forms/index.tsx";
import { PillPicker, type PillOption } from "#app/components/forms/pill-picker.tsx";
import {
	BorderlessTitleInput,
	TransactionPageGrid,
	TransactionSubmitRow,
} from "#app/components/transactions/transaction-layout.tsx";
import {
	TransactionMetaRow,
	TransactionPanel,
} from "#app/components/transactions/transaction-meta.tsx";

import type { ReactNode } from "react";

const BLANK_EVENT: EventFormSchema = {
	title: "",
	description: "",
	startDate: "",
	endDate: "",
	budgetTransaction: { value: 0, currency: "USD" },
	status: "open",
};

const STATUS_DOT: Record<string, string> = {
	open: "bg-success",
	closed: "bg-muted-foreground",
};

const STATUS_OPTIONS: PillOption[] = EVENT_STATUS_OPTIONS.map((option) => ({
	value: option.value,
	label: option.label,
	icon: (
		<span
			aria-hidden="true"
			className={`size-2 shrink-0 rounded-full ${STATUS_DOT[option.value]}`}
		/>
	),
}));

/**
 * An event in the shape the transaction form established: a title, one display-scale figure
 * (the budget, which carries no sign because it is not money moving), a row of pills holding the
 * dates and status, then the note. Create and edit render this same block.
 */
export const EventFields = withForm({
	defaultValues: BLANK_EVENT,
	props: {} as {
		formId: string;
		submitLabel: string;
		/** Create has no baseline to be dirty against, so only edit shows the note. */
		showDirty?: boolean;
		/** What the event has accumulated, rendered under the card it belongs to. */
		footer?: ReactNode;
	},
	render: ({ form, formId, submitLabel, showDirty, footer }) => {
		const amountId = useId();

		return (
			<form.Form id={formId}>
				<TransactionPageGrid
					keepAsideColumn
					main={
						<div className="flex flex-col gap-6">
							<div className="bg-card flex flex-col gap-4 rounded-lg border p-4">
								<div className="flex flex-col gap-1">
									<form.AppField
										name="title"
										validators={{
											onSubmit: ({ value }) =>
												value.trim() ? undefined : { message: "Give this event a name" },
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
														placeholder="Untitled event"
														aria-label="Event title"
														autoFocus
													/>
												</FieldControl>
												<FieldMessage />
											</Field>
										)}
									/>
									<form.AppField
										name="budgetTransaction"
										children={(field) => (
											<field.TransactionAmountHeroField
												inputId={amountId}
												onEnter={() => void form.handleSubmit()}
											/>
										)}
									/>
								</div>

								<TransactionMetaRow>
									<form.Subscribe selector={(s) => s.values.startDate}>
										{(start) => (
											<form.Subscribe selector={(s) => s.values.endDate}>
												{(end) => (
													<DateRangeChip
														start={start || undefined}
														end={end || undefined}
														onChange={(next) => {
															form.setFieldValue("startDate", next.start ?? "");
															form.setFieldValue("endDate", next.end ?? "");
														}}
													/>
												)}
											</form.Subscribe>
										)}
									</form.Subscribe>
									<form.AppField name="status">
										{(statusField) => (
											<PillPicker
												options={STATUS_OPTIONS}
												value={statusField.state.value ?? "open"}
												onValueChange={(next) =>
													statusField.handleChange(next as "open" | "closed")
												}
												placeholder="Status"
												searchable={false}
											/>
										)}
									</form.AppField>
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
							{footer}
						</div>
					}
				/>
			</form.Form>
		);
	},
});
