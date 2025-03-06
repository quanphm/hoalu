import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@hoalu/ui/select";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "./components";
import { useFieldContext } from "./context";

interface SelectFieldProps {
	options: { value: string; label: string }[];
	label?: React.ReactNode;
	description?: React.ReactNode;
}

export function SelectField(props: SelectFieldProps) {
	const field = useFieldContext<string>();

	return (
		<FormItem>
			{props.label && <FormLabel>{props.label}</FormLabel>}
			<Select onValueChange={(value) => field.handleChange(value)} value={field.state.value}>
				<FormControl>
					<SelectTrigger>
						<SelectValue placeholder="Select" />
					</SelectTrigger>
				</FormControl>
				<SelectContent>
					{props.options.map((opt) => (
						<SelectItem key={opt.value} value={opt.value}>
							{opt.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{props.description && <FormDescription>{props.description}</FormDescription>}
			<FormMessage />
		</FormItem>
	);
}
