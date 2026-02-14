import {
	Combobox,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxPopup,
} from "@hoalu/ui/combobox";

import { Field, FieldDescription, FieldLabel, FieldMessage } from "./components.tsx";
import { useFieldContext } from "./context.ts";

interface SelectOption {
	label: string;
	value: string;
}

interface Props {
	options: SelectOption[];
	label?: React.ReactNode;
	description?: React.ReactNode;
	disabled?: boolean;
}

export function SelectWithSearchField(props: Props) {
	const field = useFieldContext<string>();
	const { value } = field.state;

	const selectedOption = props.options.find((opt) => opt.value === value) ?? null;

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<Combobox<SelectOption>
				value={selectedOption}
				onValueChange={(newValue) => {
					field.handleChange(newValue?.value ?? "");
				}}
				items={props.options}
				disabled={props.disabled}
			>
				<ComboboxInput placeholder="Select" />
				<ComboboxPopup className="max-h-64">
					<ComboboxEmpty>No result.</ComboboxEmpty>
					<ComboboxList>
						{(item: SelectOption) => (
							<ComboboxItem
								key={item.value}
								value={item}
								className="grid-cols-[1fr_1rem] ps-3 pe-2 *:first:col-start-2 *:last:col-start-1 *:last:row-start-1"
							>
								{item.label}
							</ComboboxItem>
						)}
					</ComboboxList>
				</ComboboxPopup>
			</Combobox>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
