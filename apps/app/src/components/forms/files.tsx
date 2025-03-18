import { FilesUpload } from "@/components/files-upload";
import type { ImageFile } from "@/lib/schema";
import { Field, FieldControl, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";

interface Props {
	label?: React.ReactNode;
	description?: string;
}

export function FilesField(props: Props) {
	const field = useFieldContext<ImageFile[]>();

	function handleFiles(files: File[]) {
		field.handleChange(files);
	}

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<FieldControl>
				<FilesUpload onFilesSelectedUpdate={handleFiles} />
			</FieldControl>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
