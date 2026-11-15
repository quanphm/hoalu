import { Input } from "@hoalu/ui/input";
import { useRef } from "react";

import { EmojiPicker } from "#app/components/emoji-picker.tsx";
import { joinEmojiTitle, splitEmojiTitle } from "#app/helpers/emoji.ts";

import { Field, FieldControl, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: React.ReactNode;
	description?: string;
}

export function InputWithEmojiPickerField(props: Props) {
	const ref = useRef<HTMLInputElement>(null);
	const field = useFieldContext<string>();
	const { emoji, title } = splitEmojiTitle(field.state.value);

	const setTitle = (nextTitle: string) => {
		field.handleChange(joinEmojiTitle(emoji, nextTitle));
	};

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<div className="flex gap-2">
				<EmojiPicker
					emoji={emoji}
					onEmojiSelect={(nextEmoji) => {
						field.handleChange(joinEmojiTitle(nextEmoji, title));
						ref.current?.focus();
					}}
					onEmojiClear={() => {
						field.handleChange(joinEmojiTitle(null, title));
						ref.current?.focus();
					}}
				/>
				<FieldControl>
					<Input
						ref={ref}
						name={field.name}
						value={title}
						onBlur={field.handleBlur}
						onChange={(e) => setTitle(e.target.value)}
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
