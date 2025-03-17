import { useCallback, useEffect, useRef, useState } from "react";

export function useImageUpload({
	onUpload,
}: {
	onUpload?(File: File): void;
} = {}) {
	const previewRef = useRef<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	const [file, setFile] = useState<File | undefined>(undefined);

	const handleThumbnailClick = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleFileChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (file) {
				const url = URL.createObjectURL(file);
				setFile(file);
				setPreviewUrl(url);
				previewRef.current = url;
				if (onUpload) {
					onUpload(file);
				}
			}
		},
		[onUpload],
	);

	const handleRemove = useCallback(() => {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}
		setPreviewUrl(null);
		setFileName(null);
		previewRef.current = null;
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, [previewUrl]);

	useEffect(() => {
		return () => {
			if (previewRef.current) {
				URL.revokeObjectURL(previewRef.current);
			}
		};
	}, []);

	return {
		data: {
			file,
			preview: previewUrl,
		},
		fileInputRef,
		handleThumbnailClick,
		handleFileChange,
		handleRemove,
	};
}
