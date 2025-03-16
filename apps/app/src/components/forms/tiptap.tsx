import { Toolbar, extensions } from "@/components/tiptap";
import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect } from "react";
import { Field, FieldControl, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";

interface Props {
	defaultValue?: string;
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
		content: "",
		onUpdate: ({ editor }) => field.handleChange(editor.getHTML()),
	});

	useEffect(() => {
		editor?.commands.setContent(props.defaultValue || "");
	}, [editor, props.defaultValue]);

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<FieldControl>
				<div className="relative overflow-hidden rounded-lg border border-input focus-within:border-ring focus-within:outline-none focus-within:ring-[3px] focus-within:ring-ring/20">
					<Toolbar editor={editor} />
					<EditorContent editor={editor} onBlur={field.handleBlur} />
				</div>
			</FieldControl>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
