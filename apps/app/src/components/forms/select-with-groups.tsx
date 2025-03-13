import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@hoalu/ui/select";
import { Field, FieldControl, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";

interface Props {
	groups: Record<string, { name: string; options: { label: string; value: string }[] }>;
	label?: React.ReactNode;
	description?: React.ReactNode;
}

export function SelectWithGroupsField(props: Props) {
	const field = useFieldContext<string>();

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<Select defaultValue={field.state.value} onValueChange={(value) => field.handleChange(value)}>
				<FieldControl>
					<SelectTrigger className="focus:border-ring focus:ring-[3px] focus:ring-ring/20">
						<SelectValue placeholder="Select" />
					</SelectTrigger>
				</FieldControl>
				<SelectContent className="[&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8">
					{Object.entries(props.groups).map(([id, data]) => {
						return (
							<SelectGroup key={id}>
								<SelectLabel className="ps-2 text-muted-foreground/60">{data.name}</SelectLabel>
								{data.options.map((opt) => (
									<SelectItem key={opt.value} value={opt.value}>
										{opt.label}
									</SelectItem>
								))}
							</SelectGroup>
						);
					})}
				</SelectContent>
			</Select>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
