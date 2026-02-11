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
			<Select items={props.options} value={field.state.value} onValueChange={field.handleChange}>
				<FieldControl>
					<SelectTrigger className="bg-muted text-foreground focus:border-ring focus:ring-ring/20 focus:ring-[3px]">
						<SelectValue placeholder="Select" />
					</SelectTrigger>
				</FieldControl>
				<SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
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
