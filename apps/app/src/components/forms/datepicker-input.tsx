import { date } from "@hoalu/common/datetime";
import { CalendarIcon } from "@hoalu/icons/lucide";
import { Input } from "@hoalu/ui/input";
import { Field, FieldControl, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";

interface Props {
	label?: React.ReactNode;
	description?: React.ReactNode;
}

export function DatepickerInputField(props: Props) {
	const field = useFieldContext<string | undefined>();
	const selected = field.state.value ? new Date(field.state.value) : new Date();
	const inputValue = date.format(selected, "yyyy-MM-dd");

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value) {
			field.setValue(new Date(value).toISOString());
		}
	};

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<div className="flex items-center gap-3">
				<div className="relative grow">
					<FieldControl>
						<Input
							type="date"
							value={inputValue}
							onChange={handleInputChange}
							className="peer appearance-none ps-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
							min="1970-01-01"
						/>
					</FieldControl>
					<div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
						<CalendarIcon size={16} aria-hidden="true" />
					</div>
				</div>
			</div>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
