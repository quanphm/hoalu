import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect } from "react";

import { extensions, Toolbar } from "#app/components/tiptap.tsx";

import { Field, FieldControl, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";

interface Props {
	defaultValue?: string | undefined;
	label?: React.ReactNode;
	description?: string;
}

export function TiptapField(props: Props) {
	const field = useFieldContext<string>();

	const editor = useEditor({
		extensions,
		editorProps: {
			attributes: {
				class:
					"prose dark:prose-invert prose-base focus:outline-none text-foreground text-sm px-3 py-2.5 min-h-20",
			},
		},
		content: field.state.value ?? "",
		onUpdate: ({ editor }) => field.handleChange(editor.getHTML()),
	});

	useEffect(() => {
		if (!editor) {
			return;
		}
		const newValue = field.state.value ?? "";
		if (newValue !== editor.getHTML()) {
			editor.commands.setContent(newValue, { emitUpdate: false });
		}
	}, [editor, field.state.value]);

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<div className="border-input bg-background focus-within:border-ring focus-within:ring-ring/20 relative overflow-hidden rounded-lg border focus-within:ring-[3px] focus-within:outline-none">
				<Toolbar editor={editor} />
				<FieldControl>
					<EditorContent editor={editor} onBlur={field.handleBlur} />
				</FieldControl>
			</div>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
