import {
	Select,
	SelectContent,
	SelectGroup,
	SelectLabel,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@hoalu/ui/select";
import { useMemo } from "react";

import { Field, FieldControl, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";

interface Props {
	groups: Record<string, { name: string; options: { label: string; value: string }[] }>;
	label?: React.ReactNode;
	description?: React.ReactNode;
}

export function SelectWithGroupsField(props: Props) {
	const field = useFieldContext<string>();
	const items = useMemo(
		() => Object.values(props.groups).flatMap((v) => v.options),
		[props.groups],
	);

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<FieldControl>
				<Select
					items={items}
					value={field.state.value}
					onValueChange={(value) => value && field.handleChange(value)}
				>
					<SelectTrigger className="bg-muted text-foreground focus:border-ring focus:ring-ring/20 focus:ring-[3px]">
						<SelectValue />
					</SelectTrigger>

					<SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:inset-e-2">
						{Object.entries(props.groups).map(([id, data]) => {
							return (
								<SelectGroup key={id}>
									<SelectLabel className="text-muted-foreground/60 ps-2">{data.name}</SelectLabel>
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
			</FieldControl>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
