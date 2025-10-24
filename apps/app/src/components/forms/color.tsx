import { useId } from "react";

import { PG_ENUM_COLOR } from "@hoalu/common/enums";
import { RadioGroup, RadioGroupItem } from "@hoalu/ui/radio-group";
import { cn } from "@hoalu/ui/utils";

import { createCategoryTheme } from "#app/helpers/colors.ts";
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
				className="flex gap-1.5"
				value={field.state.value}
				onValueChange={(value) => {
					field.handleChange(value as string);
				}}
				onBlur={field.handleBlur}
			>
				{PG_ENUM_COLOR.map((color) => (
					<RadioGroupItem
						key={color}
						id={id}
						value={color}
						className={cn("size-6", createCategoryTheme(color))}
					/>
				))}
			</RadioGroup>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
