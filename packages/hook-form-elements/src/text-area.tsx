import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@trekapply/ui/form";
import { Textarea } from "@trekapply/ui/textarea";

interface HookFormTextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	name: string;
	label?: string;
	action?: React.ReactNode;
}

export const HookFormTextarea = (props: HookFormTextareaProps) => {
	return (
		<FormField
			name={props.name}
			render={({ field }) => {
				return (
					<FormItem>
						{props.label && <FormLabel>{props.label}</FormLabel>}
						<FormControl>
							<div className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring">
								{props.action}
								<Textarea rows={3} {...props} {...field} autoResize />
							</div>
						</FormControl>
						<FormMessage />
					</FormItem>
				);
			}}
		/>
	);
};
