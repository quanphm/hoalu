import {
	CreateEventDialogContent,
	CreateEventDialogTrigger,
} from "#app/components/events/event-actions.tsx";
import { useLiveQueryEvents } from "#app/components/events/use-events.ts";
import { PlusIcon } from "@hoalu/icons/lucide";
import { Badge } from "@hoalu/ui/badge";
import { Button } from "@hoalu/ui/button";
import {
	Combobox,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxPopup,
	ComboboxSeparator,
} from "@hoalu/ui/combobox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@hoalu/ui/dialog";
import { useState } from "react";

import { Field, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";

interface EventOption {
	label: string;
	value: string;
	status: string;
}

interface Props {
	label?: React.ReactNode;
	description?: React.ReactNode;
	disabled?: boolean;
	showClosed?: boolean;
}

export function SelectEventField(props: Props) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [comboboxOpen, setComboboxOpen] = useState(false);

	const field = useFieldContext<string>();
	const { value } = field.state;

	const allEvents = useLiveQueryEvents();
	const events = props.showClosed
		? allEvents
		: (allEvents?.filter((e) => e.status === "open") ?? []);

	const eventOptions: EventOption[] = events.map((e) => ({
		label: e.title,
		value: e.id,
		status: e.status,
	}));

	// Add "None" option at the beginning
	const options: EventOption[] = [{ label: "None", value: "", status: "" }, ...eventOptions];

	const selectedOption = options.find((opt) => opt.value === value) ?? options[0];

	const handleComboboxInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter" && !comboboxOpen) {
			event.preventDefault();
			setComboboxOpen(true);
		}
	};

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<Combobox<EventOption>
					value={selectedOption}
					onValueChange={(newValue) => {
						field.handleChange(newValue?.value ?? "");
					}}
					items={options}
					disabled={props.disabled}
					open={comboboxOpen}
					onOpenChange={setComboboxOpen}
				>
					<ComboboxInput
						placeholder="Select"
						inputClassName="h-9 items-center"
						onKeyDown={handleComboboxInputKeyDown}
					/>
					<ComboboxPopup className="max-h-64">
						<ComboboxEmpty>No events found.</ComboboxEmpty>
						<ComboboxList>
							{(item: EventOption) => (
								<ComboboxItem
									key={item.value}
									value={item}
									className="grid-cols-[1fr_1rem] ps-3 pe-2 *:first:col-start-2 *:last:col-start-1 *:last:row-start-1"
								>
									<span>{item.label}</span>
									{item.status && (
										<Badge
											size="sm"
											variant={item.status === "open" ? "success" : "error"}
											className="ml-2"
										>
											{item.status}
										</Badge>
									)}
								</ComboboxItem>
							)}
						</ComboboxList>
						<ComboboxSeparator />
						<div className="px-1 py-1">
							<DialogTrigger render={<Button variant="ghost" className="w-full justify-start" />}>
								<PlusIcon className="-ms-2 mr-2 size-4 opacity-60" aria-hidden="true" />
								Create event
							</DialogTrigger>
						</div>
					</ComboboxPopup>
				</Combobox>
				<DialogContent className="sm:max-w-[560px]">
					<DialogHeader>
						<DialogTitle>Create event</DialogTitle>
						<DialogDescription>Group expenses and bills under a named occasion.</DialogDescription>
					</DialogHeader>
					<CreateEventDialogContent />
				</DialogContent>
			</Dialog>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
