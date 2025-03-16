import { BoldIcon, ItalicIcon, ListIcon, ListOrderedIcon, UndoIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { Separator } from "@hoalu/ui/separator";
import Placeholder from "@tiptap/extension-placeholder";
import { type Editor, EditorContent, type EditorProviderProps, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const extensions = [
	StarterKit.configure({
		heading: false,
	}),
	Placeholder.configure({
		placeholder: "Write something...",
	}),
];

export function Tiptap(props: EditorProviderProps) {
	const editor = useEditor({
		extensions,
		editorProps: {
			attributes: {
				class: "",
			},
		},
		...props,
	});

	return (
		<>
			<MenuBar editor={editor} />
			<EditorContent editor={editor} />
		</>
	);
}

function MenuBar({ editor }: { editor: Editor | null }) {
	if (!editor) {
		return null;
	}

	return (
		<div className="flex items-center space-x-0.5 overflow-hidden rounded-lg rounded-b-none bg-muted/50 p-0.5">
			<Button
				variant={editor.isActive("bold") ? "default" : "ghost"}
				size="icon"
				onClick={() => editor.chain().focus().toggleBold().run()}
				disabled={!editor.can().chain().focus().toggleBold().run()}
				tabIndex={-1}
				type="button"
			>
				<BoldIcon className="h-4 w-4" />
			</Button>
			<Button
				variant={editor.isActive("italic") ? "default" : "ghost"}
				size="icon"
				onClick={() => editor.chain().focus().toggleItalic().run()}
				disabled={!editor.can().chain().focus().toggleItalic().run()}
				tabIndex={-1}
				type="button"
			>
				<ItalicIcon className="h-4 w-4" />
			</Button>
			<Button
				variant={editor.isActive("bulletList") ? "default" : "ghost"}
				size="icon"
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				tabIndex={-1}
				type="button"
			>
				<ListIcon className="h-4 w-4" />
			</Button>
			<Button
				variant={editor.isActive("orderedList") ? "default" : "ghost"}
				size="icon"
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				className={editor.isActive("orderedList") ? "is-active" : ""}
				tabIndex={-1}
				type="button"
			>
				<ListOrderedIcon className="h-4 w-4" />
			</Button>
			<Separator orientation="vertical" className="h-5" />
			<Button
				variant="ghost"
				size="icon"
				onClick={() => editor.chain().focus().undo().run()}
				disabled={!editor.can().chain().focus().undo().run()}
				tabIndex={-1}
				type="button"
			>
				<UndoIcon className="h-4 w-4" />
			</Button>
		</div>
	);
}
