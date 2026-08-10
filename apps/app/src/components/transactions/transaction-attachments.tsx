import { PaperclipIcon } from "@hoalu/icons/phosphor";
import { XIcon } from "@hoalu/icons/tabler";
import { Button } from "@hoalu/ui/button";
import { type ReactNode, forwardRef, useImperativeHandle } from "react";

import { useFilesUpload } from "#app/components/files/use-files-upload.ts";
import { TransactionSectionLabel } from "#app/components/transactions/transaction-layout.tsx";

export interface ExistingAttachmentFile {
	id: string;
	name: string;
	presignedUrl: string;
}

export interface TransactionAttachmentsRef {
	clearFiles: () => void;
}

interface TransactionAttachmentsProps {
	initialFiles?: File[];
	onFilesChange: (files: File[]) => void;
	existingFiles?: ExistingAttachmentFile[];
	onDeleteExisting?: (fileId: string) => void;
}

export const TransactionAttachments = forwardRef<
	TransactionAttachmentsRef,
	TransactionAttachmentsProps
>(function TransactionAttachments(
	{ initialFiles, onFilesChange, existingFiles, onDeleteExisting },
	ref,
) {
	const {
		data: { files, previewUrls },
		error: errors,
		fileInputRef,
		handleDragOver,
		handleDragLeave,
		handleDrop,
		handleBrowseFiles,
		handleFileChange,
		handleRemove,
		clearErrors,
		clearFiles,
	} = useFilesUpload({
		initialFiles,
		onUpload: onFilesChange,
	});

	useImperativeHandle(ref, () => ({ clearFiles }), [clearFiles]);

	const totalCount = (existingFiles?.length ?? 0) + files.length;

	return (
		<div className="flex flex-col gap-3">
			<TransactionSectionLabel>Receipt & images · {totalCount}</TransactionSectionLabel>

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

			{totalCount > 0 && (
				<ul className="grid grid-cols-2 gap-3">
					{existingFiles?.map((file) => (
						<AttachmentTile
							key={file.id}
							name={file.name}
							url={file.presignedUrl}
							onRemove={onDeleteExisting ? () => onDeleteExisting(file.id) : undefined}
						/>
					))}
					{files.map((file, index) => (
						<AttachmentTile
							key={`${file.name}-${file.size}-${file.lastModified}`}
							name={file.name}
							url={previewUrls[index]}
							onRemove={() => handleRemove(index)}
						/>
					))}
				</ul>
			)}

			<button
				type="button"
				className="border-input hover:border-ring hover:ring-ring/20 relative flex w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed p-6 text-center hover:ring-[3px] hover:outline-none"
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={handleBrowseFiles}
			>
				<p className="flex items-center gap-1.5 text-sm font-medium">
					<PaperclipIcon className="size-4" />
					Drop receipt or images
				</p>
				<p className="text-muted-foreground text-xs">or click to browse · JPG, PNG</p>
			</button>
			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				multiple
				accept="image/*"
				onChange={handleFileChange}
			/>
		</div>
	);
});

function AttachmentTile(props: { name: string; url: string; onRemove?: () => void }) {
	let content: ReactNode = (
		<>
			<div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
				<img src={props.url} alt={props.name} className="size-full object-cover" />
			</div>
			<div className="flex items-center justify-between gap-1 px-2 py-1.5">
				<span className="truncate text-xs">{props.name}</span>
				{props.onRemove && (
					<Button
						type="button"
						size="icon"
						variant="ghost"
						className="text-destructive size-5 shrink-0"
						onClick={(e) => {
							e.stopPropagation();
							props.onRemove?.();
						}}
					>
						<XIcon className="size-3" />
					</Button>
				)}
			</div>
		</>
	);

	return (
		<li className="bg-muted/50 relative overflow-hidden rounded-lg border">
			{props.url ? (
				<a
					href={props.url}
					target="_blank"
					rel="noreferrer"
					className="block"
					onClick={(e) => e.stopPropagation()}
				>
					{content}
				</a>
			) : (
				content
			)}
		</li>
	);
}
