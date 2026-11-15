import { datetime } from "@hoalu/datetime/datetime";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import {
	columnsForWidth,
	type FileEntry,
	type FileGroup,
	TILE_GAP,
} from "#app/components/files/files-model.ts";

const GAP = TILE_GAP;

interface FileSheetProps {
	groups: FileGroup[];
	onOpen: (id: string) => void;
}

export function FileSheet({ groups, onOpen }: FileSheetProps) {
	const listRef = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(0);
	const [activeId, setActiveId] = useState<string | null>(null);

	useLayoutEffect(() => {
		const element = listRef.current;
		if (!element) return undefined;

		const observer = new ResizeObserver(([entry]) => {
			if (entry) setWidth(entry.contentRect.width);
		});
		observer.observe(element);
		setWidth(element.getBoundingClientRect().width);

		return () => observer.disconnect();
	}, []);

	const columns = columnsForWidth(width);
	const entries = useMemo(() => groups.flatMap((group) => group.entries), [groups]);
	const activeIndex = useMemo(() => {
		const index = entries.findIndex((entry) => entry.id === activeId);
		return index === -1 ? 0 : index;
	}, [entries, activeId]);

	const focusEntry = useCallback((id: string) => {
		setActiveId(id);
		requestAnimationFrame(() => document.getElementById(`file-tile-${id}`)?.focus());
	}, []);

	function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, entryId: string) {
		const index = entries.findIndex((entry) => entry.id === entryId);
		if (index === -1) return;

		let next = -1;
		if (event.key === "ArrowRight") next = index + 1;
		else if (event.key === "ArrowLeft") next = index - 1;
		else if (event.key === "ArrowDown") next = index + columns;
		else if (event.key === "ArrowUp") next = index - columns;
		else if (event.key === "Home") next = 0;
		else if (event.key === "End") next = entries.length - 1;
		else return;

		event.preventDefault();
		const target = entries[next];
		if (target) focusEntry(target.id);
	}

	return (
		<div ref={listRef} className="flex flex-col">
			{groups.map((group) => (
				<div key={group.key}>
					<div className="flex items-center gap-3 pt-3 pb-1.5">
						<h3 className="text-muted-foreground text-2xs font-medium tracking-widest uppercase">
							{group.label}
						</h3>
						<span aria-hidden="true" className="bg-border h-px flex-1" />
					</div>
					<div
						className="grid pb-2"
						style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: GAP }}
					>
						{group.entries.map((entry) => (
							<FileTile
								key={entry.id}
								entry={entry}
								isActive={entry.id === entries[activeIndex]?.id}
								onFocus={() => setActiveId(entry.id)}
								onKeyDown={(event) => handleKeyDown(event, entry.id)}
								onOpen={() => onOpen(entry.id)}
							/>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

interface FileLoadMoreProps {
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	onLoadMore: () => void;
}

export function FileLoadMore({ hasNextPage, isFetchingNextPage, onLoadMore }: FileLoadMoreProps) {
	const sentinelRef = useRef<HTMLDivElement>(null);

	/**
	 * The page shell scrolls an inner element on mobile, so the viewport-relative root is the only
	 * one that works everywhere: it already clips against every scrolling ancestor.
	 */
	useEffect(() => {
		const element = sentinelRef.current;
		if (!element || !hasNextPage || isFetchingNextPage) return undefined;

		const observer = new IntersectionObserver(
			(records) => {
				if (records.some((record) => record.isIntersecting)) onLoadMore();
			},
			{ rootMargin: "0px 0px 800px 0px" },
		);
		observer.observe(element);

		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, onLoadMore]);

	return (
		<>
			<div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
			{isFetchingNextPage && (
				<p className="text-muted-foreground text-2xs pt-2 tabular-nums">Loading older files…</p>
			)}
		</>
	);
}

interface FileTileProps {
	entry: FileEntry;
	isActive: boolean;
	onFocus: () => void;
	onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
	onOpen: () => void;
}

function FileTile({ entry, isActive, onFocus, onKeyDown, onOpen }: FileTileProps) {
	return (
		<button
			type="button"
			id={`file-tile-${entry.id}`}
			tabIndex={isActive ? 0 : -1}
			onFocus={onFocus}
			onKeyDown={onKeyDown}
			onClick={onOpen}
			aria-label={`${entry.title}, ${datetime.format(entry.date, "MMMM d, yyyy")}`}
			className="group border-border bg-card hover:border-foreground/25 focus-visible:ring-ring/60 flex min-w-0 flex-col overflow-hidden rounded-md border text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
		>
			<span className="bg-muted/40 flex aspect-4/5 items-center justify-center overflow-hidden">
				<img
					src={entry.url}
					alt=""
					loading="lazy"
					decoding="async"
					className="h-full w-full object-contain p-1.5 transition-opacity group-hover:opacity-90"
				/>
			</span>
			<span className="border-border/70 flex min-w-0 flex-col gap-0.5 border-t px-2 py-1.5">
				<span className="truncate text-sm font-medium">{entry.title}</span>
				<span className="text-muted-foreground text-2xs tabular-nums">
					{datetime.format(entry.date, "MMM d, yyyy")}
				</span>
			</span>
		</button>
	);
}
