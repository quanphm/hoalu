import { datetime, toLocalISOString } from "@hoalu/datetime/datetime";
import { Button } from "@hoalu/ui/button";
import {
	DialogClose,
	DialogFooter,
	DialogHeader,
	DialogHeaderAction,
	DialogPopup,
	DialogTitle,
} from "@hoalu/ui/dialog";
import { Field, FieldGroup } from "@hoalu/ui/field";
import { useValue } from "@legendapp/state/react";
import { useNavigate, useParams } from "@tanstack/react-router";

import { deleteEventDialog } from "#app/atoms/dialogs.ts";
import {
	EventFormSchema,
	type EventFormSchema as EventFormValues,
	toCreateEventPayload,
} from "#app/components/events/event-form.ts";
import { DateRangeCalendarField } from "#app/components/forms/date-range-calendar.tsx";
import { useAppForm } from "#app/components/forms/index.tsx";
import { WarningMessage } from "#app/components/warning-message.tsx";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { useCreateEvent, useDeleteEvent } from "#app/services/mutations.ts";

interface CreateEventFormProps {
	onSuccess?: (newEventId?: string) => void;
}

/**
 * The dialog-shaped entry used from inside another form's event picker, where navigating away
 * would abandon a half-typed transaction. The Events page itself creates on a page instead.
 */
export function CreateEventForm({ onSuccess }: CreateEventFormProps) {
	const workspace = useWorkspace();
	const mutation = useCreateEvent();

	const form = useAppForm({
		defaultValues: {
			title: "",
			description: "",
			startDate: toLocalISOString(datetime.format(new Date(), "yyyy-MM-dd")),
			endDate: toLocalISOString(datetime.format(new Date(), "yyyy-MM-dd")),
			budgetTransaction: {
				value: 0,
				currency: (workspace.metadata?.currency as string) ?? "USD",
			},
		} as EventFormValues,
		validators: { onSubmit: EventFormSchema },
		onSubmit: async ({ value }) => {
			const event = await mutation.mutateAsync({ payload: toCreateEventPayload(value) });
			onSuccess?.(event?.id);
		},
	});

	return (
		<form.AppForm>
			<form.Form>
				<div className="grid grid-cols-12 gap-4">
					<FieldGroup className="col-span-12 flex flex-col gap-4 md:col-span-6">
						<form.AppField
							name="title"
							children={(field) => <field.InputField label="Title" required autoFocus />}
						/>
						<form.AppField
							name="budgetTransaction"
							children={(field) => <field.TransactionAmountField label="Budget" />}
						/>
						<form.AppField
							name="description"
							children={(field) => <field.TiptapField label="Note" />}
						/>
					</FieldGroup>
					<FieldGroup className="col-span-12 flex flex-col gap-4 md:col-span-6">
						<form.Subscribe
							selector={(state) => ({
								startDate: state.values.startDate,
								endDate: state.values.endDate,
							})}
						>
							{({ startDate: sd, endDate: ed }) => (
								<DateRangeCalendarField
									startValue={sd}
									endValue={ed}
									onStartChange={(v) => form.setFieldValue("startDate", v)}
									onEndChange={(v) => form.setFieldValue("endDate", v)}
								/>
							)}
						</form.Subscribe>
					</FieldGroup>
				</div>

				<DialogFooter>
					<Field orientation="horizontal" className="justify-end">
						<form.SubscribeButton>Create event</form.SubscribeButton>
					</Field>
				</DialogFooter>
			</form.Form>
		</form.AppForm>
	);
}

export function DeleteEventDialogContent() {
	const navigate = useNavigate();
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const mutation = useDeleteEvent();
	const dialog = useValue(deleteEventDialog.$);
	const setDialog = deleteEventDialog.set;

	const onDelete = async () => {
		if (!dialog?.data?.id) {
			setDialog({ state: false });
			return;
		}
		await mutation.mutateAsync({ id: dialog.data.id });
		navigate({ to: "/$slug/events", params: { slug } });
		setDialog({ state: false });
	};

	return (
		<DialogPopup className="sm:max-w-[480px]">
			<DialogHeader>
				<DialogTitle>Delete this event?</DialogTitle>
				<DialogHeaderAction />
			</DialogHeader>
			<WarningMessage>
				The event will be deleted. Expenses and bills linked to it will be unlinked but not deleted.
				This action cannot be undone.
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
