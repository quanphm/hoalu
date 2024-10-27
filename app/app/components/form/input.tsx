import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@trekapply/ui/form";
import { Input } from "@trekapply/ui/input";

interface HookFormInputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	name: string;
	label?: string;
}

export const HookFormInput = (props: HookFormInputProps) => {
	return (
		<FormField
			name={props.name}
			render={({ field }) => {
				return (
					<FormItem>
						{props.label && <FormLabel>{props.label}</FormLabel>}
						<FormControl>
							<Input {...props} {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				);
			}}
		/>
	);
};
