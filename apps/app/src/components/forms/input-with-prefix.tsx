import { Input } from "@hoalu/ui/input";
import { Field, FieldControl, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: React.ReactNode;
	description?: string;
}

export function InputWithPrefixField(props: InputFieldProps) {
	const field = useFieldContext<string>();

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<div className="flex rounded-lg">
				<span className="inline-flex items-center rounded-s-lg border border-input bg-muted px-3 text-muted-foreground text-sm">
					{import.meta.env.PUBLIC_APP_BASE_URL}/
				</span>
				<FieldControl>
					<Input
						name={field.name}
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(e) => field.handleChange(e.target.value)}
						className="-ms-px rounded-s-none"
						{...props}
					/>
				</FieldControl>
			</div>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
