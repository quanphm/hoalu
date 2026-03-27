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
});
type EventFormSchema = z.infer<typeof EventFormSchema>;

export function CreateEventDialogTrigger({ ...props }: ButtonProps) {
	const setDialog = useSetAtom(createEventDialogAtom);
	return (
		<Button variant="outline" {...props} onClick={() => setDialog({ state: true })}>
			Create event
		</Button>
	);
}

export function CreateEventDialogContent() {
	return (
		<DialogPopup className="sm:max-w-[560px]">
			<DialogHeader>
				<DialogTitle>Create event</DialogTitle>
				<DialogDescription>Group expenses and bills under a named occasion.</DialogDescription>
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
			startDate: "",
			endDate: "",
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
					workspaceId: workspace.id,
				},
			});
			setDialog({ state: false });
		},
	});

	return (
		<form.AppForm>
			<form.Form>
				<FieldGroup className="p-4">
					<form.AppField
						name="title"
						children={(f) => <f.InputField label="Title" required autoFocus />}
					/>
					<div className="grid grid-cols-2 gap-4">
						<form.AppField
							name="startDate"
							children={(f) => <f.DatepickerInputField label="Start date" />}
						/>
						<form.AppField
							name="endDate"
							children={(f) => <f.DatepickerInputField label="End date" />}
						/>
					</div>
					<form.AppField
						name="budgetTransaction"
						children={(f) => <f.TransactionAmountField label="Budget (optional)" />}
					/>
					<form.AppField name="description" children={(f) => <f.TiptapField label="Notes" />} />
				</FieldGroup>
				<DialogFooter>
					<Field orientation="horizontal" className="justify-end px-4 pb-4">
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
		<DialogPopup className="sm:max-w-[560px]">
			<DialogHeader>
				<DialogTitle>Edit event</DialogTitle>
				<DialogHeaderAction />
			</DialogHeader>
			<EditEventForm event={event} />
		</DialogPopup>
	);
}

function EditEventForm({ event }: { event: SyncedEvent }) {
	const mutation = useEditEvent();
	const setDialog = useSetAtom(editEventDialogAtom);

	const form = useAppForm({
		defaultValues: {
			title: event.title,
			description: event.description ?? "",
			startDate: event.start_date ?? "",
			endDate: event.end_date ?? "",
			budgetTransaction: {
				value: event.budget ?? 0,
				currency: event.budget_currency,
			},
		} as EventFormSchema,
		validators: { onSubmit: EventFormSchema },
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				id: event.id,
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
				<FieldGroup className="p-4">
					<form.AppField name="title" children={(f) => <f.InputField label="Title" required />} />
					<div className="grid grid-cols-2 gap-4">
						<form.AppField
							name="startDate"
							children={(f) => <f.DatepickerInputField label="Start date" />}
						/>
						<form.AppField
							name="endDate"
							children={(f) => <f.DatepickerInputField label="End date" />}
						/>
					</div>
					<form.AppField
						name="budgetTransaction"
						children={(f) => <f.TransactionAmountField label="Budget (optional)" />}
					/>
					<form.AppField
						name="description"
						children={(f) => <f.TiptapField label="Notes" defaultValue={event.description ?? ""} />}
					/>
				</FieldGroup>
				<DialogFooter>
					<Field orientation="horizontal" className="justify-end px-4 pb-4">
						<form.SubscribeButton>Update event</form.SubscribeButton>
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
