import { datetime } from "@hoalu/datetime/datetime";
import { ArrowSquareOutIcon, CaretLeftIcon, CaretRightIcon } from "@hoalu/icons/phosphor";
import { Button } from "@hoalu/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogHeaderAction,
	DialogTitle,
} from "@hoalu/ui/dialog";
import { Link, useParams } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";

import { formatFileSize, type FileEntry } from "#app/components/files/files-model.ts";

interface FileViewerProps {
	entries: FileEntry[];
	index: number | null;
	onSelect: (index: number | null) => void;
	hasMore: boolean;
	isLoadingMore: boolean;
	onLoadMore: () => void;
}

export function FileViewer({
	entries,
	index,
	onSelect,
	hasMore,
	isLoadingMore,
	onLoadMore,
}: FileViewerProps) {
	const total = entries.length;
	const open = index !== null && entries[index] !== undefined;
	const current = open ? entries[index] : null;
	const meta = current
		? [current.expenseBill ? `Bill · ${current.expenseBill}` : null, formatFileSize(current.size)]
				.filter(Boolean)
				.join(" · ")
		: "";
	const { slug } = useParams({ from: "/_dashboard/$slug" });

	const goTo = useCallback(
		(next: number) => {
			if (total === 0) return;
			if (next >= total && hasMore) return;
			onSelect(((next % total) + total) % total);
		},
		[total, hasMore, onSelect],
	);

	useEffect(() => {
		if (!open || !hasMore || isLoadingMore) return;
		if ((index ?? 0) >= total - 2) onLoadMore();
	}, [open, hasMore, isLoadingMore, index, total, onLoadMore]);

	useEffect(() => {
		if (!open) return undefined;

		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				onSelect(null);
				return;
			}
			if (event.key === "ArrowLeft") goTo((index ?? 0) - 1);
			if (event.key === "ArrowRight") goTo((index ?? 0) + 1);
		}

		window.addEventListener("keydown", onKeyDown, true);
		return () => window.removeEventListener("keydown", onKeyDown, true);
	}, [open, index, goTo, onSelect]);

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) onSelect(null);
			}}
		>
			<DialogContent className="max-w-4xl gap-3">
				<DialogHeader>
					<DialogTitle className="truncate">{current?.title ?? ""}</DialogTitle>
					<DialogDescription className="tabular-nums">
						{current
							? `${datetime.format(current.date, "MMM d, yyyy")} · ${(index ?? 0) + 1} of ${total}`
							: ""}
					</DialogDescription>
					<DialogHeaderAction>
						<Button
							size="icon-sm"
							variant="outline"
							aria-label="Previous file"
							disabled={total < 2}
							onClick={() => goTo((index ?? 0) - 1)}
						>
							<CaretLeftIcon className="size-4" />
						</Button>
						<Button
							size="icon-sm"
							variant="outline"
							aria-label="Next file"
							disabled={total < 2}
							onClick={() => goTo((index ?? 0) + 1)}
						>
							<CaretRightIcon className="size-4" />
						</Button>
					</DialogHeaderAction>
				</DialogHeader>

				{current && (
					<div className="bg-muted/40 flex items-center justify-center overflow-hidden rounded-md border">
						<img
							key={current.id}
							src={current.url}
							alt={current.title}
							className="max-h-[50vh] w-auto max-w-full object-contain sm:max-h-[68vh]"
						/>
					</div>
				)}

				{current && (current.expensePublicId || meta) && (
					<div className="flex flex-col gap-2 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
						{meta && <p className="text-muted-foreground text-2xs min-w-0 truncate">{meta}</p>}
						{current.expensePublicId && (
							<Button
								size="sm"
								variant="outline"
								className="sm:ms-auto"
								render={
									<Link
										to="/$slug/transactions/$transactionId"
										params={{ slug, transactionId: current.expensePublicId }}
										onClick={() => onSelect(null)}
									/>
								}
							>
								Open transaction
								<ArrowSquareOutIcon className="size-3.5" />
							</Button>
						)}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
