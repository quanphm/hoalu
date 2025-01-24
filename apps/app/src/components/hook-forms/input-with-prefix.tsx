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

export const HookFormInputWithPrefix = (props: HookFormInputProps) => {
	return (
		<FormField
			name={props.name}
			render={({ field }) => {
				return (
					<FormItem>
						{props.label && <FormLabel>{props.label}</FormLabel>}
						<FormControl>
							<div className="flex rounded-lg">
								<span className="inline-flex items-center rounded-s-lg border border-input bg-muted px-3 text-muted-foreground text-sm">
									hoalu.app/
								</span>
								<Input {...props} {...field} className="-ms-px rounded-s-none" />
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
