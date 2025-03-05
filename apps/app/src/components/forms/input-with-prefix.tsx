import { Input } from "@hoalu/ui/input";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "./components";
import { useFieldContext } from "./context";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: React.ReactNode;
	description?: string;
}

export function InputWithPrefixField(props: InputFieldProps) {
	const field = useFieldContext<string>();

	return (
		<FormItem>
			{props.label && <FormLabel>{props.label}</FormLabel>}
			<div className="flex rounded-lg">
				<span className="inline-flex items-center rounded-s-lg border border-input bg-muted px-3 text-muted-foreground text-sm">
					{import.meta.env.PUBLIC_APP_BASE_URL}/
				</span>
				<FormControl>
					<Input
						id={field.name}
						name={field.name}
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(e) => field.handleChange(e.target.value)}
						className="-ms-px rounded-s-none"
						{...props}
					/>
				</FormControl>
			</div>
			{props.description && <FormDescription>{props.description}</FormDescription>}
			<FormMessage />
		</FormItem>
	);
}
