import { useFilesUpload } from "#app/components/files/use-files-upload.ts";
import { PaperclipIcon } from "@hoalu/icons/lucide";
import { XIcon } from "@hoalu/icons/tabler";
import { Button } from "@hoalu/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { type ReactNode, forwardRef, useEffect, useImperativeHandle, useRef } from "react";

interface FilesCompactUploadProps {
	onFilesSelectedUpdate?: (files: File[]) => void;
	children: (trigger: ReactNode) => ReactNode;
}

export interface FilesCompactUploadRef {
	clearFiles: () => void;
}

export const FilesCompactUpload = forwardRef<FilesCompactUploadRef, FilesCompactUploadProps>(
	({ onFilesSelectedUpdate, children }, ref) => {
		const {
			data: { files, previewUrls },
			error: errors,
			fileInputRef,
			handleBrowseFiles,
			handleFileChange,
			handleRemove,
			clearErrors,
			clearFiles,
		} = useFilesUpload({
			onUpload: onFilesSelectedUpdate,
		});

		const previewRef = useRef<HTMLUListElement>(null);
		const hasScrolledRef = useRef(false);

		useImperativeHandle(
			ref,
			() => ({
				clearFiles,
			}),
			[clearFiles],
		);

		useEffect(() => {
			if (files.length > 0 && !hasScrolledRef.current) {
				hasScrolledRef.current = true;
				previewRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
			}
		}, [files.length]);

		const trigger = (
			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							type="button"
							size="icon"
							variant="ghost"
							aria-label="Add attachments"
							onClick={handleBrowseFiles}
						/>
					}
				>
					<PaperclipIcon className="size-4" />
				</TooltipTrigger>
				<TooltipContent side="top">Add attachments</TooltipContent>
			</Tooltip>
		);

		return (
			<>
				{errors.length > 0 && (
					<div className="border-destructive/20 bg-destructive/10 text-destructive rounded-md border p-3">
						<div className="mb-1 flex items-center justify-between">
							<h3 className="text-sm font-medium">Upload failed</h3>
							<button type="button" onClick={clearErrors}>
								<XIcon className="size-4 text-current" />
							</button>
						</div>
						<ul className="text-destructive space-y-1 text-xs">
							{errors.map((error) => (
								<li key={error}>{error}</li>
							))}
						</ul>
					</div>
				)}

				{files.length > 0 && (
					<ul ref={previewRef} className="grid grid-cols-5 gap-1.5 px-4">
						{files.map((file, index) => (
							<li key={file.name} className="bg-muted/50 relative flex rounded-md text-sm">
								<div className="relative aspect-square w-full overflow-hidden rounded-md">
									<img src={previewUrls[index]} alt="" />
									<div className="bg-muted/90 absolute bottom-0 w-full p-1 text-center text-xs">
										{(file.size / (1024 * 1024)).toFixed(2)}MB
									</div>
								</div>
								<div className="absolute top-1 right-1 flex items-center gap-2">
									<Button
										size="icon"
										variant="secondary"
										className="size-6 rounded-full"
										onClick={(e) => {
											e.stopPropagation();
											handleRemove(index);
										}}
									>
										<XIcon className="size-4" />
									</Button>
								</div>
							</li>
						))}
					</ul>
				)}

				<input
					type="file"
					ref={fileInputRef}
					className="hidden"
					multiple
					accept="image/*"
					onChange={handleFileChange}
				/>

				{children(trigger)}
			</>
		);
	},
);
