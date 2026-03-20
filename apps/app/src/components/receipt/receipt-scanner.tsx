import { scanReceiptDialogAtom } from "#app/atoms/dialogs.ts";
import { MAX_QUEUE_SIZE } from "#app/helpers/constants.ts";
import { useScanQueue, type ReceiptScanInput } from "#app/hooks/use-scan-queue.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { FileTextIcon, ScanIcon, UploadIcon, XIcon, AlertCircleIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { cn } from "@hoalu/ui/utils";
import { useSetAtom } from "jotai";
import { useCallback, useRef, useState } from "react";

const MAX_FILES = MAX_QUEUE_SIZE;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];
const ACCEPTED_MIME_SET = new Set(ACCEPTED_TYPES);

interface PendingFile {
	file: File;
	previewUrl: string | null;
}

function isPdf(file: File) {
	return file.type === "application/pdf";
}

/**
 * Compress an image file to a JPEG base64 string (max 1280px wide, 0.75 quality).
 * For PDFs, returns the raw base64 data URL of the original file bytes so the
 * AI vision model can try to parse it.
 */
async function encodeFileForOcr(file: File): Promise<{
	base64: string;
	previewBase64: string | null;
}> {
	if (isPdf(file)) {
		// Send the raw PDF bytes as base64
		const buffer = await file.arrayBuffer();
		const bytes = new Uint8Array(buffer);
		let binary = "";
		for (const byte of bytes) {
			binary += String.fromCharCode(byte);
		}
		const base64 = `data:application/pdf;base64,${btoa(binary)}`;
		return { base64, previewBase64: null };
	}

	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");
				if (!ctx) {
					reject(new Error("Failed to get canvas context"));
					return;
				}

				const maxWidth = 1280;
				let width = img.width;
				let height = img.height;

				if (width > maxWidth) {
					height = (height * maxWidth) / width;
					width = maxWidth;
				}

				canvas.width = width;
				canvas.height = height;
				ctx.drawImage(img, 0, 0, width, height);

				const base64 = canvas.toDataURL("image/jpeg", 0.75);
				resolve({ base64, previewBase64: base64 });
			};
			img.onerror = () => reject(new Error("Failed to load image"));
			img.src = e.target?.result as string;
		};
		reader.onerror = () => reject(new Error("Failed to read file"));
		reader.readAsDataURL(file);
	});
}

export function ReceiptScanner() {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
	const [isDragging, setIsDragging] = useState(false);
	const [isEncoding, setIsEncoding] = useState(false);
	const setScanDialog = useSetAtom(scanReceiptDialogAtom);
	const workspace = useWorkspace();
	const { add, remainingSlots } = useScanQueue();

	const addFiles = useCallback(
		(incoming: File[]) => {
			const valid = incoming.filter((f) => ACCEPTED_MIME_SET.has(f.type));
			if (valid.length === 0) return;

			setPendingFiles((prev) => {
				const combined = [...prev];
				for (const file of valid) {
					if (combined.length >= remainingSlots) break;
					// Deduplicate by name + size
					const isDupe = combined.some(
						(p) => p.file.name === file.name && p.file.size === file.size,
					);
					if (!isDupe) {
						combined.push({
							file,
							previewUrl: isPdf(file) ? null : URL.createObjectURL(file),
						});
					}
				}
				return combined;
			});
		},
		[remainingSlots],
	);

	const removeFile = (index: number) => {
		setPendingFiles((prev) => {
			const next = [...prev];
			const removed = next.splice(index, 1)[0];
			if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
			return next;
		});
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files ?? []);
		addFiles(files);
		e.target.value = "";
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		if (!e.currentTarget.contains(e.relatedTarget as Node)) {
			setIsDragging(false);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const files = Array.from(e.dataTransfer.files);
		addFiles(files);
	};

	const handleAddToQueue = async () => {
		if (pendingFiles.length === 0) return;

		setIsEncoding(true);
		try {
			const encoded = await Promise.all(
				pendingFiles.map(async (p) => {
					const { base64, previewBase64 } = await encodeFileForOcr(p.file);
					return { file: p.file, previewBase64, base64 };
				}),
			);

			for (const item of encoded) {
				const input: ReceiptScanInput = {
					fileName: item.file.name,
					fileSize: item.file.size,
					fileType: item.file.type,
					previewBase64: item.previewBase64,
					encodedBase64: item.base64,
					workspaceSlug: workspace.slug,
				};
				add(input);
			}

			setPendingFiles((prev) => {
				for (const p of prev) {
					if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
				}
				return [];
			});

			setScanDialog({ state: false });
		} catch (error) {
			console.error("Receipt scan error:", error);
		} finally {
			setIsEncoding(false);
		}
	};

	const isQueueFull = remainingSlots === 0;

	return (
		<div className="flex w-full flex-col gap-4">
			{isQueueFull && (
				<div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/50">
					<AlertCircleIcon className="size-4 text-amber-600 dark:text-amber-400" />
					<p className="text-sm text-amber-800 dark:text-amber-200">
						Queue is full. Please wait for jobs to complete or remove some items.
					</p>
				</div>
			)}

			<div
				className={cn(
					"flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors",
					isDragging && !isQueueFull ? "border-primary bg-primary/5" : "border-muted-foreground/25",
					isQueueFull && "cursor-not-allowed opacity-50",
				)}
				onDragOver={(e) => {
					if (!isQueueFull) handleDragOver(e);
				}}
				onDragLeave={handleDragLeave}
				onDrop={(e) => {
					if (!isQueueFull) handleDrop(e);
				}}
			>
				<div className="bg-muted flex size-12 items-center justify-center rounded-full">
					<UploadIcon className="text-muted-foreground size-5" />
				</div>
				<div className="text-center">
					<p className="text-sm font-medium">Drop files here or browse</p>
					<p className="text-muted-foreground mt-1 text-xs">
						Images (JPEG, PNG, WEBP, HEIC) or PDF — up to {MAX_FILES} files
						{remainingSlots < MAX_FILES &&
							` (${remainingSlots} slot${remainingSlots !== 1 ? "s" : ""} remaining)`}
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => {
							if (fileInputRef.current) {
								fileInputRef.current.removeAttribute("capture");
								fileInputRef.current.click();
							}
						}}
						disabled={isQueueFull}
					>
						Browse files
					</Button>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => {
							if (fileInputRef.current) {
								fileInputRef.current.setAttribute("capture", "environment");
								fileInputRef.current.click();
							}
						}}
						disabled={isQueueFull}
					>
						Use camera
					</Button>
				</div>
			</div>

			<input
				ref={fileInputRef}
				type="file"
				accept={ACCEPTED_TYPES.join(",")}
				multiple
				className="hidden"
				onChange={handleFileInputChange}
				disabled={isQueueFull}
			/>

			{pendingFiles.length > 0 && (
				<div className="space-y-3">
					<p className="text-sm font-medium">
						{pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""} selected
					</p>
					<div className="flex flex-wrap gap-2">
						{pendingFiles.map((p, idx) => (
							<div
								key={`${p.file.name}-${p.file.size}`}
								className="group relative size-24 shrink-0"
							>
								<div className="border-muted bg-muted/50 size-full overflow-hidden rounded-md border">
									{p.previewUrl ? (
										<img
											src={p.previewUrl}
											alt={p.file.name}
											className="h-full w-full object-cover"
										/>
									) : (
										<div className="flex h-full flex-col items-center justify-center gap-1 p-2">
											<FileTextIcon className="text-muted-foreground size-6" />
											<span className="text-muted-foreground line-clamp-2 text-center text-[10px] leading-tight">
												{p.file.name}
											</span>
										</div>
									)}
								</div>
								<button
									type="button"
									onClick={() => removeFile(idx)}
									className="bg-background border-muted absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full border opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
								>
									<XIcon className="size-3" />
								</button>
							</div>
						))}
					</div>

					<Button
						type="button"
						className="w-full"
						onClick={handleAddToQueue}
						disabled={isEncoding || isQueueFull}
					>
						Start scan
					</Button>
				</div>
			)}
		</div>
	);
}
