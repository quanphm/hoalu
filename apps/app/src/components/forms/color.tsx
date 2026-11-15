import { PG_ENUM_COLOR } from "@hoalu/schema/enums";
import { RadioGroup, RadioGroupItem } from "@hoalu/ui/radio-group";
import { cn } from "@hoalu/ui/utils";
import { useId } from "react";

import { createChartColor } from "#app/helpers/colors.ts";

import { Field, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";

interface Props {
	label?: React.ReactNode;
	description?: string;
}

export function ColorsField(props: Props) {
	const id = useId();
	const field = useFieldContext<string>();

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<RadioGroup
				className="flex flex-wrap items-center gap-1.5"
				aria-label={typeof props.label === "string" ? props.label : undefined}
				value={field.state.value}
				onValueChange={(value) => {
					field.handleChange(value as string);
				}}
				onBlur={field.handleBlur}
			>
				{PG_ENUM_COLOR.map((color) => (
					<RadioGroupItem
						key={color}
						id={`${id}-${color}`}
						value={color}
						aria-label={`${color.charAt(0).toUpperCase()}${color.slice(1)} color`}
						title={color}
						className={cn(
							createChartColor(color),
							"size-6 shrink-0 rounded-full shadow-none",
							"border border-white/20",
							"transition-[border-color] duration-150 ease-out",
							"data-checked:border-foreground data-checked:border-2",
							"active:scale-95",
							"[&_[data-slot=radio-group-indicator]]:hidden",
						)}
					/>
				))}
			</RadioGroup>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
