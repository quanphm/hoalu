import { useId } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { EventFields } from "#app/components/events/event-fields.tsx";
import {
	EventFormSchema,
	type EventFormSchema as EventFormValues,
	toUpdateEventPayload,
} from "#app/components/events/event-form.ts";
import { type SyncedEvent } from "#app/components/events/use-events.ts";
import { useAppForm } from "#app/components/forms/index.tsx";
import {
	TransactionCloseAction,
	TransactionPageHeader,
} from "#app/components/transactions/transaction-layout.tsx";
import { KEYBOARD_SHORTCUTS } from "#app/helpers/constants.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { useEditEvent } from "#app/services/mutations.ts";

import type { ReactNode } from "react";

interface EventEditFormProps {
	event: SyncedEvent;
	headerActions?: ReactNode;
	onClose: () => void;
	/** What the event has accumulated, rendered under the card it belongs to. */
	children?: ReactNode;
}

export function EventEditForm({ event, headerActions, onClose, children }: EventEditFormProps) {
	const workspace = useWorkspace();
	const mutation = useEditEvent();
	const formId = useId();

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
		} as EventFormValues,
		validators: { onSubmit: EventFormSchema },
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({ id: event.id, payload: toUpdateEventPayload(value) });
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

	return (
		<form.AppForm>
			<TransactionPageHeader
				className="bg-background sticky top-0 z-10"
				title={
					<form.Subscribe selector={(s) => s.values.title}>
						{(title) => title || "Untitled event"}
					</form.Subscribe>
				}
				actions={
					<>
						{headerActions}
						<TransactionCloseAction onClose={onClose} />
					</>
				}
			/>
			<EventFields form={form} formId={formId} submitLabel="Update" showDirty footer={children} />
		</form.AppForm>
	);
}
