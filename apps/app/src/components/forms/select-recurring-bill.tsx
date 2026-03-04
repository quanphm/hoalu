import { CreateRecurringBillForm } from "#app/components/recurring-bills/recurring-bill-actions.tsx";
import { useLiveQueryRecurringBills } from "#app/components/recurring-bills/use-recurring-bills.ts";
import { PlusIcon } from "@hoalu/icons/lucide";
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

interface RecurringBillOption {
	label: string;
	value: string;
}

interface Props {
	label?: React.ReactNode;
	description?: React.ReactNode;
	disabled?: boolean;
	/**
	 * Filter bills by repeat cadence to only show relevant bills.
	 * e.g. repeat="monthly" will only show monthly bills.
	 * If omitted, all bills are shown.
	 */
	repeat?: string;
	/** Pre-fill the "Create new bill" form with these values. */
	defaultDate?: string;
}

export function SelectRecurringBillField(props: Props) {
	const [dialogOpen, setDialogOpen] = useState(false);

	const field = useFieldContext<string | undefined>();
	const { value } = field.state;

	const bills = useLiveQueryRecurringBills();
	const filtered = props.repeat
		? bills.filter((b) => b.repeat === props.repeat)
		: bills;

	const options: RecurringBillOption[] = [
		{ value: "", label: "None" },
		...filtered.map((b) => ({ value: b.id, label: b.title })),
	];

	const selectedOption = options.find((o) => o.value === (value ?? "")) ?? options[0];

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<Combobox<RecurringBillOption>
					value={selectedOption}
					onValueChange={(newValue) => {
						field.handleChange(newValue?.value || undefined);
					}}
					items={options}
					disabled={props.disabled}
				>
					<ComboboxInput placeholder="Select" inputClassName="h-9 items-center" />
					<ComboboxPopup className="max-h-64">
						<ComboboxEmpty>No result.</ComboboxEmpty>
						<ComboboxList>
							{(item: RecurringBillOption) => (
								<ComboboxItem
									key={item.value}
									value={item}
									className="grid-cols-[1fr_1rem] ps-3 pe-2 *:first:col-start-2 *:last:col-start-1 *:last:row-start-1"
								>
									{item.label}
								</ComboboxItem>
							)}
						</ComboboxList>
						<ComboboxSeparator />
						<div className="px-1 py-1">
							<DialogTrigger render={<Button variant="ghost" className="w-full justify-start" />}>
								<PlusIcon className="-ms-2 mr-2 size-4 opacity-60" aria-hidden="true" />
								Set up recurring bill
							</DialogTrigger>
						</div>
					</ComboboxPopup>
				</Combobox>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>Set up recurring bill</DialogTitle>
						<DialogDescription>Track this as a recurring payment going forward.</DialogDescription>
					</DialogHeader>
					<CreateRecurringBillForm
						defaultDate={props.defaultDate}
						onSuccess={(newBillId?: string) => {
							field.handleChange(newBillId || undefined);
							setDialogOpen(false);
						}}
					/>
				</DialogContent>
			</Dialog>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
