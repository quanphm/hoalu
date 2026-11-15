import { datetime } from "@hoalu/datetime/datetime";
import { defaultRangeExtractor, useWindowVirtualizer } from "@tanstack/react-virtual";
import type { Range } from "@tanstack/react-virtual";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import {
	buildSheetRows,
	columnsForWidth,
	type FileEntry,
	type FileGroup,
	TILE_GAP,
} from "#app/components/files/files-model.ts";

const GAP = TILE_GAP;
const CAPTION_HEIGHT = 46;
const MONTH_ROW_HEIGHT = 30;

interface FileSheetProps {
	groups: FileGroup[];
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	onLoadMore: () => void;
	onOpen: (id: string) => void;
}

export function FileSheet({
	groups,
	hasNextPage,
	isFetchingNextPage,
	onLoadMore,
	onOpen,
}: FileSheetProps) {
	const listRef = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(0);
	const [scrollMargin, setScrollMargin] = useState(0);
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

	useLayoutEffect(() => {
		const element = listRef.current;
		if (!element) return undefined;

		const measure = () => setScrollMargin(element.getBoundingClientRect().top + window.scrollY);
		measure();
		window.addEventListener("resize", measure);

		const observer = new ResizeObserver(measure);
		observer.observe(document.body);

		return () => {
			window.removeEventListener("resize", measure);
			observer.disconnect();
		};
	}, []);

	const columns = columnsForWidth(width);
	const rows = useMemo(() => buildSheetRows(groups, columns), [groups, columns]);
	const entries = useMemo(() => groups.flatMap((group) => group.entries), [groups]);
	const tileWidth = columns > 0 ? (width - GAP * (columns - 1)) / columns : 0;

	const rowIndexById = useMemo(() => {
		const index = new Map<string, number>();
		rows.forEach((row, rowIndex) => {
			if (row.type !== "tiles") return;
			for (const entry of row.entries) index.set(entry.id, rowIndex);
		});
		return index;
	}, [rows]);

	const activeIndex = useMemo(() => {
		const index = entries.findIndex((entry) => entry.id === activeId);
		return index === -1 ? 0 : index;
	}, [entries, activeId]);

	const activeRowIndex = useMemo(() => {
		const entry = entries[activeIndex];
		return entry ? (rowIndexById.get(entry.id) ?? -1) : -1;
	}, [entries, activeIndex, rowIndexById]);

	// oxlint-disable-next-line react/incompatible-library -- TanStack Virtual hands back non-memoizable handles by design; the compiler skips this component.
	const virtualizer = useWindowVirtualizer({
		count: rows.length,
		overscan: 4,
		scrollMargin,
		estimateSize: (index) =>
			rows[index]?.type === "month" ? MONTH_ROW_HEIGHT : tileWidth * 1.25 + CAPTION_HEIGHT,
		measureElement: (element) => element.getBoundingClientRect().height,
		rangeExtractor: useCallback(
			(range: Range) => {
				const next = new Set(defaultRangeExtractor(range));
				if (activeRowIndex >= 0) next.add(activeRowIndex);
				return [...next].sort((a, b) => a - b);
			},
			[activeRowIndex],
		),
	});

	const focusEntry = useCallback((id: string) => {
		setActiveId(id);
		requestAnimationFrame(() => document.getElementById(`file-tile-${id}`)?.focus());
	}, []);

	const virtualItems = virtualizer.getVirtualItems();
	const lastVisibleIndex = virtualItems.at(-1)?.index ?? 0;

	useEffect(() => {
		if (!hasNextPage || isFetchingNextPage) return;
		if (lastVisibleIndex >= rows.length - 2) onLoadMore();
	}, [hasNextPage, isFetchingNextPage, lastVisibleIndex, rows.length, onLoadMore]);

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
		<div>
			<div ref={listRef}>
				<div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
					{virtualItems.map((virtualRow) => {
						const row = rows[virtualRow.index];
						if (!row) return null;

						return (
							<div
								key={virtualRow.key}
								data-index={virtualRow.index}
								ref={virtualizer.measureElement}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									transform: `translateY(${virtualRow.start - scrollMargin}px)`,
								}}
							>
								{row.type === "month" ? (
									<div className="flex items-center gap-3 pt-3 pb-1.5">
										<h3 className="text-muted-foreground text-2xs font-medium tracking-widest uppercase">
											{row.label}
										</h3>
										<span aria-hidden="true" className="bg-border h-px flex-1" />
									</div>
								) : (
									<div
										className="pb-2"
										style={{
											display: "grid",
											gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
											gap: GAP,
										}}
									>
										{row.entries.map((entry) => (
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
								)}
							</div>
						);
					})}
				</div>
			</div>

			{isFetchingNextPage && (
				<p className="text-muted-foreground text-2xs pt-2 tabular-nums">Loading older files…</p>
			)}
		</div>
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
