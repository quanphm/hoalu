import { useFilesUpload } from "@/hooks/use-files-upload";
import { FILE_LIMIT, FILE_SIZE_LIMIT } from "@hoalu/common/io";
import { UploadIcon, XIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";

interface FileUploadProps {
	acceptedFileTypes?: string;
	maxFiles?: number;
	maxSizeMB?: number;
	onFilesSelectedUpdate?: (files: File[]) => void;
}

export function FilesUpload({
	acceptedFileTypes = "image/*",
	maxFiles = FILE_LIMIT,
	maxSizeMB = FILE_SIZE_LIMIT / (1024 * 1024),
	onFilesSelectedUpdate,
}: FileUploadProps) {
	const {
		data: { files, previewUrls },
		error: errors,
		fileInputRef,
		handleDragLeave,
		handleDragOver,
		handleDrop,
		handleRemove,
		handleBrowseFiles,
		handleFileChange,
		clearErrors,
	} = useFilesUpload({
		onUpload: onFilesSelectedUpdate,
	});

	return (
		<div className="w-full">
			{errors.length > 0 && (
				<div className="mb-2.5 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-destructive">
					<div className="mb-1 flex items-center justify-between">
						<h3 className="font-medium text-sm">Upload failed</h3>
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								clearErrors();
							}}
						>
							<XIcon className="h-4 w-4 text-current" />
						</button>
					</div>
					<ul className="space-y-1 text-destructive text-xs">
						{errors.map((error, index) => (
							<li key={index}>{error}</li>
						))}
					</ul>
				</div>
			)}

			{files.length > 0 && (
				<ul className="mb-2.5 grid grid-cols-4 gap-1.5">
					{files.map((file, index) => (
						<li key={file.name} className="relative flex rounded-md bg-muted/50 text-sm">
							<div className="relative aspect-square w-full overflow-hidden rounded-md">
								<img src={previewUrls[index]} alt="" />
								<div className="absolute bottom-0 w-full bg-muted/90 p-1 text-center text-xs">
									{(file.size / (1024 * 1024)).toFixed(2)}MB
								</div>
							</div>
							<div className="absolute top-1 right-1 flex items-center gap-2">
								<Button
									size="icon"
									variant="destructive"
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

			<div
				className="relative rounded-lg border border-input p-4 hover:border-ring hover:outline-none hover:ring-[3px] hover:ring-ring/20"
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={handleBrowseFiles}
				onKeyDown={handleBrowseFiles}
			>
				<input
					type="file"
					ref={fileInputRef}
					className="hidden"
					multiple={maxFiles > 1}
					accept={acceptedFileTypes}
					onChange={handleFileChange}
				/>

				<div className="flex items-center justify-start gap-2.5">
					<div className="rounded-full bg-primary/10 p-3">
						<UploadIcon className="size-4 text-primary" />
					</div>
					<div>
						<p className="font-medium text-sm">Click to upload or drag and drop</p>
						<p className="mt-1 text-muted-foreground text-xs">
							You may upload PNG or JPEG files. Max {maxFiles} {maxFiles === 1 ? "file" : "files"}{" "}
							up to {maxSizeMB}MB each.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
