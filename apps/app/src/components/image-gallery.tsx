import { ChevronLeftIcon, ChevronRightIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogHeaderAction,
	DialogTitle,
} from "@hoalu/ui/dialog";
import { useCallback, useEffect, useState } from "react";

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

	const goTo = useCallback(
		(index: number) => {
			setSelectedIndex((index + total) % total);
		},
		[total],
	);

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
	}, [open, selectedIndex, goTo]);

	return (
		<>
			<div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
				{data.map((image, index) => (
					// oxlint-disable-next-line jsx_a11y/no-static-element-interactions
					<div
						key={image.id ?? image.name}
						// oxlint-disable-next-line
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
				<DialogContent className="max-w-3xl">
					<DialogHeader>
						<DialogTitle>Preview</DialogTitle>
						<DialogHeaderAction>
							<Button
								size="icon-sm"
								variant="outline"
								onClick={() => goTo((selectedIndex ?? 0) - 1)}
							>
								<ChevronLeftIcon className="size-5" />
							</Button>
							<Button
								size="icon-sm"
								variant="outline"
								onClick={() => goTo((selectedIndex ?? 0) + 1)}
							>
								<ChevronRightIcon className="size-5" />
							</Button>
						</DialogHeaderAction>
					</DialogHeader>
					<div className="relative flex min-h-[40vh] items-center justify-center bg-black/90">
						{current && (
							<img
								key={current.presignedUrl}
								src={current.presignedUrl}
								alt={current.description ?? ""}
								className="h-[60vh] object-contain md:h-[72vh]"
							/>
						)}
					</div>
					{current?.description && (
						<p className="text-muted-foreground text-sm">{current.description}</p>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
