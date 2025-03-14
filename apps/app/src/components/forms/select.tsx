import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@hoalu/ui/select";
import { Field, FieldControl, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";

interface Props {
	options: { value: string; label: string }[];
	label?: React.ReactNode;
	description?: React.ReactNode;
}

export function SelectField(props: Props) {
	const field = useFieldContext<string>();

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<Select value={field.state.value} onValueChange={field.handleChange}>
				<FieldControl>
					<SelectTrigger className="focus:border-ring focus:ring-[3px] focus:ring-ring/20">
						<SelectValue placeholder="Select" />
					</SelectTrigger>
				</FieldControl>
				<SelectContent className="[&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8">
					{props.options.map((opt) => (
						<SelectItem key={opt.value} value={opt.value}>
							{opt.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
