import { Input } from "@hoalu/ui/input";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./components";

interface HookFormInputWithPrefixProps extends React.InputHTMLAttributes<HTMLInputElement> {
	name: string;
	label?: string;
	description?: string;
}

export const HookFormInputWithPrefix = (props: HookFormInputWithPrefixProps) => {
	return (
		<FormField
			name={props.name}
			render={({ field }) => {
				return (
					<FormItem>
						{props.label && <FormLabel>{props.label}</FormLabel>}
						<div className="flex rounded-lg">
							<span className="inline-flex items-center rounded-s-lg border border-input bg-muted px-3 text-muted-foreground text-sm">
								hoalu.app/
							</span>
							<FormControl>
								<Input {...props} {...field} className="-ms-px rounded-s-none" />
							</FormControl>
						</div>
						{props.description && <FormDescription>{props.description}</FormDescription>}
						<FormMessage />
					</FormItem>
				);
			}}
		/>
	);
};
