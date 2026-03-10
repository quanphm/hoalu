import { ChevronLeftIcon, ChevronRightIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { Dialog, DialogContent } from "@hoalu/ui/dialog";
import { useEffect, useState } from "react";

interface ImageItem {
	id?: string;
	name: string;
	description: string | null;
	presignedUrl: string;
}

interface ImageGalleryProps {
	data: ImageItem[];
}

export function ImageGallery({ data }: ImageGalleryProps) {
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const open = selectedIndex !== null;
	const current = selectedIndex !== null ? data[selectedIndex] : null;
	const total = data.length;

	function goTo(index: number) {
		setSelectedIndex((index + total) % total);
	}

	function close() {
		setSelectedIndex(null);
	}

	useEffect(() => {
		if (!open) return;

		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "ArrowLeft") goTo((selectedIndex ?? 0) - 1);
			if (e.key === "ArrowRight") goTo((selectedIndex ?? 0) + 1);
		}

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [open, selectedIndex]);

	return (
		<>
			<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
				{data.map((image, index) => (
					<div
						key={image.id ?? image.name}
						tabIndex={0}
						className="group bg-muted/50 hover:border-primary/50 relative aspect-square cursor-pointer overflow-hidden rounded-md border transition-all hover:shadow-md"
						onClick={() => setSelectedIndex(index)}
						onKeyUp={(e) => e.key === "Enter" && setSelectedIndex(index)}
					>
						<img
							src={image.presignedUrl}
							alt={image.description ?? ""}
							className="h-full w-full object-cover transition-transform group-hover:scale-105"
						/>
						{image.description && (
							<div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
								<p className="truncate text-xs text-white">{image.description}</p>
							</div>
						)}
					</div>
				))}
			</div>

			<Dialog open={open} onOpenChange={(o) => !o && close()}>
				<DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden">
					{/* Header */}
					<div className="px-6 pt-6 pb-4 pr-12">
						<h2 className="text-xl font-semibold leading-none">Attachment preview</h2>
					</div>

					{/* Image area */}
					<div className="relative flex items-center justify-center bg-black/90 min-h-[40vh]">
						{current && (
							<img
								key={current.presignedUrl}
								src={current.presignedUrl}
								alt={current.description ?? ""}
								className="max-h-[60vh] w-full object-contain"
							/>
						)}
						{total > 1 && (
							<>
								<Button
									type="button"
									size="icon"
									variant="ghost"
									className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60"
									onClick={() => goTo((selectedIndex ?? 0) - 1)}
								>
									<ChevronLeftIcon className="size-5" />
								</Button>
								<Button
									type="button"
									size="icon"
									variant="ghost"
									className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60"
									onClick={() => goTo((selectedIndex ?? 0) + 1)}
								>
									<ChevronRightIcon className="size-5" />
								</Button>
								<div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
									{data.map((_, i) => (
										<button
											key={i}
											type="button"
											className={`size-1.5 rounded-full transition-colors ${i === selectedIndex ? "bg-white" : "bg-white/40"}`}
											onClick={() => setSelectedIndex(i)}
										/>
									))}
								</div>
							</>
						)}
					</div>

					{/* Footer — only shown when there's a description */}
					{current?.description && (
						<div className="bg-muted/50 border-t px-6 py-4">
							<p className="text-muted-foreground text-sm">{current.description}</p>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
