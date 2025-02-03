import { Input } from "@hoalu/ui/input";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./components";

interface HookFormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	name: string;
	label?: React.ReactNode;
	description?: string;
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
						{props.description && <FormDescription>{props.description}</FormDescription>}
						<FormMessage />
					</FormItem>
				);
			}}
		/>
	);
};
