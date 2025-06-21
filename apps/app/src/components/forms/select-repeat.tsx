import { Label } from "@hoalu/ui/label";
import { RadioGroup, RadioGroupItem } from "@hoalu/ui/radio-group";
import { AVAILABLE_REPEAT_OPTIONS } from "@/helpers/constants";
import {
	Field,
	FieldControl,
	FieldDescription,
	FieldLabel,
	FieldMessage,
	useFieldControlContext,
} from "./components";
import { useFieldContext } from "./context";

interface Props {
	label?: React.ReactNode;
	description?: React.ReactNode;
}

export function RepeatField(props: Props) {
	const { formItemId: id } = useFieldControlContext();
	const field = useFieldContext<string>();

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<FieldControl>
				<RadioGroup
					value={field.state.value}
					onValueChange={field.handleChange}
					className="grid-cols-3"
				>
					{AVAILABLE_REPEAT_OPTIONS.map((option) => (
						<div key={option.value} className="flex items-center gap-2">
							<RadioGroupItem value={option.value} id={`${id}-${option.value}`} />
							<Label htmlFor={`${id}-${option.value}`}>{option.label}</Label>
						</div>
					))}
				</RadioGroup>
			</FieldControl>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
