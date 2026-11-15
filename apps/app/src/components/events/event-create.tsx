import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useId } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { EventFields } from "#app/components/events/event-fields.tsx";
import {
	EventFormSchema,
	type EventFormSchema as EventFormValues,
	toCreateEventPayload,
} from "#app/components/events/event-form.ts";
import { useAppForm } from "#app/components/forms/index.tsx";
import {
	TransactionCloseAction,
	TransactionPageHeader,
} from "#app/components/transactions/transaction-layout.tsx";
import { KEYBOARD_SHORTCUTS } from "#app/helpers/constants.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { useCreateEvent } from "#app/services/mutations.ts";

const routeApi = getRouteApi("/_dashboard/$slug/events/new");

/**
 * An event gets a page rather than a dialog: it owns a budget, a date range and a status, and
 * `/$eventId` is already a page that shows what the event has accumulated.
 */
export function CreateEventPage() {
	const workspace = useWorkspace();
	const { slug } = routeApi.useParams();
	const { returnTo, type } = routeApi.useSearch();
	const navigate = useNavigate();
	const mutation = useCreateEvent();
	const formId = useId();
	const returnToTransaction = returnTo === "transaction";
	const transactionType = type ?? "expense";

	const form = useAppForm({
		defaultValues: {
			title: "",
			description: "",
			// No dates until the user picks them: a pre-filled range makes the calendar open on a
			// finished range, so the first click on a day fights the value instead of starting one.
			startDate: "",
			endDate: "",
			budgetTransaction: {
				value: 0,
				currency: workspace.metadata?.currency ?? "USD",
			},
			status: "open",
		} as EventFormValues,
		validators: { onSubmit: EventFormSchema },
		onSubmit: async ({ value }) => {
			const event = await mutation.mutateAsync({ payload: toCreateEventPayload(value) });
			if (returnToTransaction) {
				navigate({
					to: "/$slug/transactions/new",
					params: { slug },
					search: { type: transactionType, eventId: event.id },
				});
				return;
			}
			navigate({ to: "/$slug/events", params: { slug } });
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

	const handleClose = () =>
		returnToTransaction
			? navigate({
					to: "/$slug/transactions/new",
					params: { slug },
					search: { type: transactionType },
				})
			: navigate({ to: "/$slug/events", params: { slug } });

	return (
		<form.AppForm>
			<TransactionPageHeader
				title={
					<span className="flex min-w-0 items-center gap-2">
						<form.Subscribe selector={(s) => s.values.title}>
							{(title) => <span className="truncate">{title || "New event"}</span>}
						</form.Subscribe>
						{returnToTransaction && (
							<span className="text-muted-foreground shrink-0 text-xs">
								· Returns to your {transactionType}
							</span>
						)}
					</span>
				}
				actions={<TransactionCloseAction onClose={handleClose} />}
			/>
			<EventFields form={form} formId={formId} submitLabel="Create event" />
		</form.AppForm>
	);
}
