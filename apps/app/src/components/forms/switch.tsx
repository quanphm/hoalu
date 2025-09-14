import { Switch } from "@hoalu/ui/switch";
import { Field, FieldControl, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: React.ReactNode;
	description?: string;
}

export function SwitchField(props: Props) {
	const field = useFieldContext<boolean>();

	return (
		<Field>
			<div className="inline-flex items-center gap-2">
				{props.label && <FieldLabel>{props.label}</FieldLabel>}
				<FieldControl>
					<Switch
						checked={field.state.value}
						onCheckedChange={field.handleChange}
						aria-label="Toggle switch"
					/>
				</FieldControl>
			</div>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
