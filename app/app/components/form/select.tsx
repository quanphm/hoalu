import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@trekapply/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@trekapply/ui/select";

interface HookFormSelectProps {
	name: string;
	label?: string;
	placeholder?: string;
	items: {
		id?: string | number;
		label: string;
		value: string;
	}[];
}

export const HookFormSelect = (props: HookFormSelectProps) => {
	return (
		<FormField
			name={props.name}
			render={({ field }) => (
				<FormItem>
					{props.label && <FormLabel>{props.label}</FormLabel>}
					<Select onValueChange={field.onChange} defaultValue={field.value}>
						<FormControl>
							<SelectTrigger>
								<SelectValue placeholder={props.placeholder || "Select"} />
							</SelectTrigger>
						</FormControl>
						<SelectContent>
							{props.items.map((item, idx) => (
								<SelectItem key={item.id || idx} value={item.value}>
									{item.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</FormItem>
			)}
		/>
	);
};
