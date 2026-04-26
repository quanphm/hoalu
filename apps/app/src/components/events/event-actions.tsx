import {
	createEventDialogAtom,
	deleteEventDialogAtom,
	editEventDialogAtom,
} from "#app/atoms/dialogs.ts";
import {
	type SyncedEvent,
	useLiveQueryEvents,
	useSelectedEvent,
} from "#app/components/events/use-events.ts";
import { DateRangeCalendarField } from "#app/components/forms/date-range-calendar.tsx";
import { useAppForm } from "#app/components/forms/index.tsx";
import { WarningMessage } from "#app/components/warning-message.tsx";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { useCreateEvent, useDeleteEvent, useEditEvent } from "#app/services/mutations.ts";
import { Button, type ButtonProps } from "@hoalu/ui/button";
import {
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogHeaderAction,
	DialogPopup,
	DialogTitle,
} from "@hoalu/ui/dialog";
import { Field, FieldGroup } from "@hoalu/ui/field";
import { useAtom, useSetAtom } from "jotai";
import * as z from "zod";

const EventFormSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	budgetTransaction: z
		.object({
			value: z.number(),
			currency: z.string(),
		})
		.optional(),
	status: z.enum(["open", "closed"]).optional(),
});
type EventFormSchema = z.infer<typeof EventFormSchema>;

const EVENT_STATUS_OPTIONS = [
	{ label: "Open", value: "open" },
	{ label: "Closed", value: "closed" },
];

export function CreateEventDialogTrigger({ ...props }: ButtonProps) {
	const setDialog = useSetAtom(createEventDialogAtom);
	return (
		<Button size="sm" {...props} onClick={() => setDialog({ state: true })}>
			New event
		</Button>
	);
}

export function CreateEventDialogContent() {
	return (
		<DialogPopup className="sm:max-w-[800px]">
			<DialogHeader>
				<DialogTitle>Create event</DialogTitle>
				<DialogDescription>Group expenses and bills under occasions.</DialogDescription>
				<DialogHeaderAction />
			</DialogHeader>
			<CreateEventForm />
		</DialogPopup>
	);
}

function CreateEventForm() {
	const workspace = useWorkspace();
	const mutation = useCreateEvent();
	const setDialog = useSetAtom(createEventDialogAtom);

	const form = useAppForm({
		defaultValues: {
			title: "",
			description: "",
			startDate: new Date().toISOString(),
			endDate: new Date().toISOString(),
			budgetTransaction: {
				value: 0,
				currency: (workspace.metadata?.currency as string) ?? "USD",
			},
		} as EventFormSchema,
		validators: { onSubmit: EventFormSchema },
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				payload: {
					title: value.title,
					description: value.description,
					startDate: value.startDate || undefined,
					endDate: value.endDate || undefined,
					budget: value.budgetTransaction?.value,
					currency: value.budgetTransaction?.currency,
				},
			});
			setDialog({ state: false });
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

export function EditEventDialogContent() {
	const [dialog] = useAtom(editEventDialogAtom);
	const events = useLiveQueryEvents();
	const event = events.find((e) => e.id === dialog?.data?.id) ?? null;
	if (!event) return null;
	return (
		<DialogPopup className="sm:max-w-[800px]">
			<DialogHeader>
				<DialogTitle>Edit event</DialogTitle>
				<DialogHeaderAction />
			</DialogHeader>
			<EditEventForm event={event} />
		</DialogPopup>
	);
}

function EditEventForm({ event }: { event: SyncedEvent }) {
	const workspace = useWorkspace();
	const mutation = useEditEvent();
	const setDialog = useSetAtom(editEventDialogAtom);

	const form = useAppForm({
		defaultValues: {
			title: event.title,
			description: event.description ?? "",
			startDate: event.start_date ?? "",
			endDate: event.end_date ?? "",
			budgetTransaction: {
				value: event.realBudget ?? 0,
				currency: event.budget_currency ?? workspace.metadata.currency,
			},
			status: event.status ?? "open",
		} as EventFormSchema,
		validators: { onSubmit: EventFormSchema },
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				id: event.id,
				payload: {
					title: value.title,
					description: value.description,
					startDate: value.startDate ?? undefined,
					endDate: value.endDate ?? undefined,
					budget: value.budgetTransaction?.value,
					currency: value.budgetTransaction?.currency,
					status: value.status,
				},
			});
			setDialog({ state: false });
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
							name="status"
							children={(field) => (
								<field.SelectField label="Status" options={EVENT_STATUS_OPTIONS} />
							)}
						/>
						<form.AppField
							name="budgetTransaction"
							children={(field) => <field.TransactionAmountField label="Budget" />}
						/>
						<form.AppField
							name="description"
							children={(field) => (
								<field.TiptapField label="Note" defaultValue={event.description ?? ""} />
							)}
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
						<form.SubscribeButton>Update</form.SubscribeButton>
					</Field>
				</DialogFooter>
			</form.Form>
		</form.AppForm>
	);
}

export function DeleteEventDialogContent() {
	const { onSelectEvent } = useSelectedEvent();
	const mutation = useDeleteEvent();
	const [dialog, setDialog] = useAtom(deleteEventDialogAtom);

	const onDelete = async () => {
		if (!dialog?.data?.id) {
			setDialog({ state: false });
			return;
		}
		await mutation.mutateAsync({ id: dialog.data.id });
		onSelectEvent(null);
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
