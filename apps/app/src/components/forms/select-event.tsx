import { CalendarStarIcon, PlusIcon } from "@hoalu/icons/phosphor";
import { Button } from "@hoalu/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@hoalu/ui/dialog";
import { Link, useParams } from "@tanstack/react-router";
import { useState } from "react";

import { CreateEventForm } from "#app/components/events/event-actions.tsx";
import { type SyncedEvent, useLiveQueryEvents } from "#app/components/events/use-events.ts";

import { Field, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";
import { PillPicker, type PillOption, type PillSection } from "./pill-picker";

interface Props {
	label?: React.ReactNode;
	description?: React.ReactNode;
	placeholder?: string;
	appearance?: "pill" | "field";
	/**
	 * `navigate` sends the user to the event page and back with the new id, which the host form
	 * can only afford when it keeps a draft. Hosts without one keep the in-place dialog.
	 */
	createAction?: "dialog" | "navigate";
	/** Which transaction form the create page should return to. */
	transactionType?: "expense" | "income";
	disabled?: boolean;
	showClosed?: boolean;
}

export function SelectEventField(props: Props) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const field = useFieldContext<string>();
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const transactionType = props.transactionType ?? "expense";

	const allEvents = useLiveQueryEvents();
	const events = props.showClosed
		? (allEvents ?? [])
		: (allEvents ?? []).filter((event) => event.status === "open");

	const toOption = (event: SyncedEvent): PillOption => ({
		value: event.id,
		label: event.title,
	});
	const noEvent: PillOption = { value: "", label: "No event" };
	const options: PillOption[] = [noEvent, ...events.map(toOption)];

	// A heading replaces the badge a row would otherwise carry, so grouping only pays off when the
	// list can mix statuses — an open-only picker stays flat.
	const sections: PillSection[] | undefined = props.showClosed
		? [
				{ label: "", options: [noEvent] },
				{
					label: "Open",
					options: events.filter((event) => event.status === "open").map(toOption),
				},
				{
					label: "Closed",
					options: events.filter((event) => event.status === "closed").map(toOption),
				},
			].filter((section) => section.options.length > 0)
		: undefined;

	const placeholder =
		props.placeholder ?? (typeof props.label === "string" ? props.label : "Event");

	return (
		<Field className={props.appearance === "field" ? "gap-1" : "w-fit! gap-1 [&>*]:w-auto!"}>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<PillPicker
					options={options}
					sections={sections}
					value={field.state.value ?? ""}
					onValueChange={(value) => field.handleChange(value)}
					placeholder={placeholder}
					triggerIcon={<CalendarStarIcon className="size-3.5" aria-hidden="true" />}
					appearance={props.appearance}
					searchPlaceholder="Search events…"
					disabled={props.disabled}
					emptyMessage="No events found."
					footer={
						props.createAction === "navigate" ? (
							<Button
								variant="ghost"
								className="w-full justify-start"
								render={
									<Link
										to="/$slug/events/new"
										params={{ slug }}
										search={{ returnTo: "transaction", type: transactionType }}
									/>
								}
							>
								<PlusIcon className="-ms-1 me-2 size-3.5 opacity-60" aria-hidden="true" />
								Create event
							</Button>
						) : (
							<DialogTrigger render={<Button variant="ghost" className="w-full justify-start" />}>
								<PlusIcon className="-ms-1 me-2 size-3.5 opacity-60" aria-hidden="true" />
								Create event
							</DialogTrigger>
						)
					}
				/>
				<DialogContent className="sm:max-w-[720px]">
					<DialogHeader>
						<DialogTitle>Create event</DialogTitle>
						<DialogDescription>Group expenses and bills under a named occasion.</DialogDescription>
					</DialogHeader>
					<CreateEventForm onSuccess={() => setDialogOpen(false)} />
				</DialogContent>
			</Dialog>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
