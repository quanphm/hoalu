import { EmojiPicker } from "@/components/emoji-picker";
import { Input } from "@hoalu/ui/input";
import { useRef } from "react";
import { Field, FieldControl, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: React.ReactNode;
	description?: string;
}

export function InputWithEmojiPickerField(props: Props) {
	const ref = useRef<HTMLInputElement>(null);
	const field = useFieldContext<string>();

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<div className="flex gap-2">
				<EmojiPicker
					onEmojiSelect={(emoji) => {
						field.handleChange(`${emoji} ${field.state.value}`);
						ref.current?.focus();
					}}
				/>
				<FieldControl>
					<Input
						ref={ref}
						name={field.name}
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(e) => field.handleChange(e.target.value)}
						className="flex-1"
						{...props}
					/>
				</FieldControl>
			</div>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
