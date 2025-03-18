import { FILE_LIMIT, FILE_SIZE_LIMIT } from "@hoalu/common/io";
import { useCallback, useEffect, useRef, useState } from "react";

export function useFilesUpload({
	acceptedFileTypes = "image/*",
	maxFiles = FILE_LIMIT,
	maxSizeMB = FILE_SIZE_LIMIT / (1024 * 1024),
	onUpload,
}: {
	acceptedFileTypes?: string;
	maxFiles?: number;
	maxSizeMB?: number;
	onUpload?(files: File[]): void;
}) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const previewRef = useRef<string[] | null>(null);

	const [files, setFiles] = useState<File[]>([]);
	const [previewUrls, setPreviewUrls] = useState<string[]>([]);
	const [errors, setErrors] = useState<string[]>([]);

	const validateFiles = useCallback(
		(fileList: FileList | null): { validFiles: File[]; errors: string[] } => {
			const validFiles: File[] = [];
			const newErrors: string[] = [];

			if (!fileList) {
				return { validFiles, errors: newErrors };
			}

			// Check if adding new files would exceed the max files limit
			if (files.length + fileList.length > maxFiles) {
				newErrors.push(`You can only upload a maximum of ${maxFiles} files`);
				return { validFiles, errors: newErrors };
			}

			Array.from(fileList).forEach((file, _idx) => {
				if (acceptedFileTypes && !file.type.match(acceptedFileTypes)) {
					newErrors.push(`File "${file.name}" has an invalid file type`);
					return;
				}
				if (file.size > maxSizeMB * 1024 * 1024) {
					newErrors.push(`File "${file.name}" exceeds the maximum size of ${maxSizeMB}MB`);
					return;
				}
				validFiles.push(file);
			});

			return { validFiles, errors: newErrors };
		},
		[acceptedFileTypes, files.length, maxFiles, maxSizeMB],
	);

	const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.stopPropagation();
	};
	const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.stopPropagation();
	};

	const onFilesChange = (fileList: FileList | null) => {
		const { validFiles, errors } = validateFiles(fileList);
		if (errors.length > 0) {
			setErrors(errors);
			return;
		}
		if (validFiles.length > 0) {
			const updatedFiles = [...files, ...validFiles];
			setFiles(updatedFiles);

			const updatedPreviewUrls = updatedFiles.map((file) => URL.createObjectURL(file));
			setPreviewUrls(updatedPreviewUrls);
			previewRef.current = updatedPreviewUrls;

			if (onUpload) onUpload(updatedFiles);
		}
	};
	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.stopPropagation();
		onFilesChange(event.dataTransfer.files);
	};
	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		onFilesChange(event.target.files);
	};

	const handleBrowseFiles = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleRemove = (index: number) => {
		const updatedFiles = [...files];
		updatedFiles.splice(index, 1);
		setFiles(updatedFiles);

		const updatedPreviewUrls = [...previewUrls];
		// manual cleanup
		const deletedUrls = updatedPreviewUrls.splice(index, 1);
		for (const url of deletedUrls) {
			URL.revokeObjectURL(url);
		}
		setPreviewUrls(updatedPreviewUrls);
		previewRef.current = updatedPreviewUrls;

		if (onUpload) onUpload(updatedFiles);
	};

	const clearErrors = () => setErrors([]);

	useEffect(() => {
		return () => {
			if (previewRef.current) {
				for (const url of previewRef.current) {
					URL.revokeObjectURL(url);
				}
			}
		};
	}, []);

	return {
		data: {
			files,
			previewUrls,
		},
		error: errors,
		fileInputRef,
		handleDragOver,
		handleDragLeave,
		handleDrop,
		handleBrowseFiles,
		handleFileChange,
		handleRemove,
		clearErrors,
	};
}
