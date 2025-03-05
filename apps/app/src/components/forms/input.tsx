import { Input } from "@hoalu/ui/input";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "./components";
import { useFieldContext } from "./context";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: React.ReactNode;
	description?: string;
}

export function InputField(props: InputFieldProps) {
	const field = useFieldContext<string>();

	return (
		<FormItem>
			{props.label && <FormLabel>{props.label}</FormLabel>}
			<FormControl>
				<Input
					id={field.name}
					name={field.name}
					value={field.state.value}
					onBlur={field.handleBlur}
					onChange={(e) => field.handleChange(e.target.value)}
					{...props}
				/>
			</FormControl>
			{props.description && <FormDescription>{props.description}</FormDescription>}
			<FormMessage />
		</FormItem>
	);
}
