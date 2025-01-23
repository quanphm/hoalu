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
	label?: string;
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
							<div className="relative overflow-hidden rounded-md bg-background focus-within:ring-1 focus-within:ring-ring">
								<Input {...props} {...field} />
							</div>
						</FormControl>
						{props.description && <FormDescription>{props.description}</FormDescription>}
						<FormMessage />
					</FormItem>
				);
			}}
		/>
	);
};
