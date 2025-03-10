import { Input } from "@hoalu/ui/input";
import { Field, FieldControl, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: React.ReactNode;
	description?: string;
}

export function InputField(props: Props) {
	const field = useFieldContext<string>();

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<FieldControl>
				<Input
					name={field.name}
					value={field.state.value}
					onBlur={field.handleBlur}
					onChange={(e) => field.handleChange(e.target.value)}
					{...props}
				/>
			</FieldControl>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
