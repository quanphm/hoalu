import { CalendarStarIcon, PlusIcon } from "@hoalu/icons/phosphor";
import { Badge } from "@hoalu/ui/badge";
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
import { useLiveQueryEvents } from "#app/components/events/use-events.ts";

import { Field, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";
import { PillPicker, type PillOption } from "./pill-picker";

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

	const options: PillOption[] = [
		{ value: "", label: "No event" },
		...events.map((event) => ({
			value: event.id,
			label: event.title,
			meta: event.status ? (
				<Badge size="sm" variant={event.status === "open" ? "success" : "error"}>
					{event.status}
				</Badge>
			) : undefined,
		})),
	];

	const placeholder =
		props.placeholder ?? (typeof props.label === "string" ? props.label : "Event");

	return (
		<Field className={props.appearance === "field" ? "gap-1" : "w-fit! gap-1 [&>*]:w-auto!"}>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<PillPicker
					options={options}
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
