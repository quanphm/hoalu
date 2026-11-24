import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useState } from "react";

import { extensions, Toolbar } from "#app/components/tiptap.tsx";
import { htmlToText } from "#app/helpers/dom-parser.ts";

import { Field, FieldControl, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";

interface Props {
	defaultValue?: string | undefined;
	label?: React.ReactNode;
	description?: string;
	/** Called on Cmd/Ctrl+Enter. ProseMirror swallows the document keydown. */
	onSave?: () => void;
}

const EDITOR_CLASS =
	"prose dark:prose-invert prose-base focus:outline-none text-foreground text-sm px-3 py-2.5 min-h-20";

export function TiptapField(props: Props) {
	const field = useFieldContext<string>();
	const [isActive, setIsActive] = useState(false);

	if (!isActive) {
		const text = htmlToText(field.state.value ?? "");
		return (
			<Field>
				{props.label && <FieldLabel>{props.label}</FieldLabel>}
				<textarea
					readOnly
					value={text}
					aria-label={typeof props.label === "string" ? props.label : "Note"}
					className="border-input bg-background focus:border-ring focus:ring-ring/20 min-h-20 w-full resize-none rounded-lg border px-3 py-2.5 text-sm focus:ring-[3px] focus:outline-none"
					onFocus={() => setIsActive(true)}
					onClick={() => setIsActive(true)}
				/>
				{props.description && <FieldDescription>{props.description}</FieldDescription>}
				<FieldMessage />
			</Field>
		);
	}

	return <TiptapEditor {...props} />;
}

function TiptapEditor(props: Props) {
	const field = useFieldContext<string>();

	const editor = useEditor({
		extensions,
		autofocus: "end",
		editorProps: {
			attributes: {
				class: EDITOR_CLASS,
			},
			handleKeyDown: (_view, event) => {
				if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
					event.preventDefault();
					props.onSave?.();
					return true;
				}
				return false;
			},
		},
		content: field.state.value ?? "",
		onUpdate: ({ editor }) => field.handleChange(editor.getHTML()),
	});

	useEffect(() => {
		// `useEditor` keeps handing back the instance after Tiptap tears it down — React
		// StrictMode double-invokes effects, so a destroyed editor is reachable here.
		// Calling `getHTML()` on one throws: `destroy()` nulls the schema while the last
		// EditorState survives, so the serializer receives `null`.
		if (!editor || editor.isDestroyed) {
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
