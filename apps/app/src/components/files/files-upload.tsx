import { useFilesUpload } from "#app/components/files/use-files-upload.ts";
import { FILE_LIMIT, FILE_SIZE_LIMIT } from "@hoalu/common/io";
import { UploadIcon } from "@hoalu/icons/lucide";
import { XIcon } from "@hoalu/icons/tabler";
import { Button } from "@hoalu/ui/button";

interface FileUploadProps {
	id?: string;
	acceptedFileTypes?: string;
	maxFiles?: number;
	maxSizeMB?: number;
	onFilesSelectedUpdate?: (files: File[]) => void;
}

export function FilesUpload({
	id,
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
				<div className="border-destructive/20 bg-destructive/10 text-destructive mb-2.5 rounded-md border p-3">
					<div className="mb-1 flex items-center justify-between">
						<h3 className="text-sm font-medium">Upload failed</h3>
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								clearErrors();
							}}
						>
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

			<div
				role="button"
				tabIndex={0}
				className="border-input hover:border-ring hover:ring-ring/20 relative rounded-lg border p-4 hover:ring-[3px] hover:outline-none"
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={handleBrowseFiles}
				onKeyDown={handleBrowseFiles}
			>
				<input
					id={id}
					type="file"
					ref={fileInputRef}
					className="hidden"
					multiple={maxFiles > 1}
					accept={acceptedFileTypes}
					onChange={handleFileChange}
				/>

				<div className="flex items-center justify-start gap-2.5">
					<div className="bg-primary/10 rounded-full p-3">
						<UploadIcon className="text-primary size-4" />
					</div>
					<div>
						<p className="text-sm font-medium">Click to upload or drag and drop</p>
						<p className="text-muted-foreground mt-1 text-xs">
							Accepted file types: PNG, JPG, JPEG. Max {maxFiles}{" "}
							{maxFiles === 1 ? "file" : "files"} up to {maxSizeMB}MB each.
						</p>
					</div>
				</div>
			</div>

			{files.length > 0 && (
				<ul className="mt-2.5 grid grid-cols-4 gap-1.5">
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
		</div>
	);
}
