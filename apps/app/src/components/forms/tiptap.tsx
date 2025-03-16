import { Tiptap } from "@/components/tiptap";
import { Field, FieldControl, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext, useFormContext } from "./context";

interface Props {
	label?: React.ReactNode;
	description?: string;
}

export function TiptapField(props: Props) {
	const field = useFieldContext<string>();
	const form = useFormContext();

	return (
		<>
			<form.Subscribe selector={(state) => state.values.description}>
				{(value) => (
					<Field>
						{props.label && <FieldLabel>{props.label}</FieldLabel>}
						<FieldControl>
							<div className="relative min-h-36 overflow-hidden rounded-lg border border-input focus-within:border-ring focus-within:outline-none focus-within:ring-[3px] focus-within:ring-ring/20">
								<Tiptap
									content={value}
									onBlur={field.handleBlur}
									onUpdate={({ editor }) => field.handleChange(editor.getHTML())}
									{...props}
								/>
							</div>
						</FieldControl>
						{props.description && <FieldDescription>{props.description}</FieldDescription>}
						<FieldMessage />
					</Field>
				)}
			</form.Subscribe>
		</>
	);
}
