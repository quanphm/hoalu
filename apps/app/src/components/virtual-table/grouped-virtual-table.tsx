import { cn } from "@hoalu/ui/utils";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { defaultRangeExtractor, useVirtualizer } from "@tanstack/react-virtual";
import type { Range } from "@tanstack/react-virtual";
import { memo, useCallback, useEffect, useEffectEvent, useMemo, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";

const THEAD_HEIGHT = 32;

// ─── Flat item types ──────────────────────────────────────────────────────────

type GroupHeaderFlatItem<TRow, TGroupKey extends string> = {
	type: "group-header";
	groupKey: TGroupKey;
	items: TRow[];
};

type RowFlatItem<TRow> = {
	type: "row";
	item: TRow;
};

type FlatItem<TRow, TGroupKey extends string> =
	| GroupHeaderFlatItem<TRow, TGroupKey>
	| RowFlatItem<TRow>;

// ─── Grouping ─────────────────────────────────────────────────────────────────

function buildFlatItems<TRow, TGroupKey extends string>(
	items: TRow[],
	groupBy?: (item: TRow) => TGroupKey,
	groupOrder?: TGroupKey[] | ((a: TGroupKey, b: TGroupKey) => number),
): FlatItem<TRow, TGroupKey>[] {
	if (!groupBy) {
		return items.map((item) => ({ type: "row", item }));
	}

	const grouped = new Map<TGroupKey, TRow[]>();
	for (const item of items) {
		const key = groupBy(item);
		const existing = grouped.get(key);
		if (existing) existing.push(item);
		else grouped.set(key, [item]);
	}

	let sortedKeys = Array.from(grouped.keys());
	if (Array.isArray(groupOrder)) {
		sortedKeys = sortedKeys.sort((a, b) => {
			const ai = groupOrder.indexOf(a);
			const bi = groupOrder.indexOf(b);
			return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
		});
	} else if (typeof groupOrder === "function") {
		sortedKeys = sortedKeys.sort(groupOrder);
	}

	const flat: FlatItem<TRow, TGroupKey>[] = [];
	for (const key of sortedKeys) {
		const groupItems = grouped.get(key)!;
		flat.push({ type: "group-header", groupKey: key, items: groupItems });
		for (const row of groupItems) flat.push({ type: "row", item: row });
	}
	return flat;
}

export interface GroupedVirtualTableProps<TRow, TGroupKey extends string = string> {
	// Data
	items: TRow[];
	getItemId: (item: TRow) => string;

	// Grouping — omit for ungrouped (Events)
	groupBy?: (item: TRow) => TGroupKey;
	groupOrder?: TGroupKey[] | ((a: TGroupKey, b: TGroupKey) => number);
	renderGroupHeader?: (groupKey: TGroupKey, items: TRow[]) => React.ReactNode;
	estimateGroupHeaderSize?: number;

	// Columns + layout
	columns: ColumnDef<TRow>[];
	gridTemplate: string;
	renderRow: (item: TRow, isSelected: boolean) => React.ReactNode;
	estimateRowSize?: number;

	// Selection
	selectedId?: string | null;
	onSelectItem?: (id: string | null) => void;
	// When true, j/k/esc hotkeys drive selection inside the list.
	// Set false when a detail panel owns those keys (e.g. Transactions URL routing).
	enableKeyboardNav?: boolean;

	// Empty state
	emptyState?: React.ReactNode;
}

function GroupedVirtualTableInner<TRow, TGroupKey extends string = string>({
	items,
	getItemId,
	groupBy,
	groupOrder,
	renderGroupHeader,
	estimateGroupHeaderSize = 32,
	columns,
	gridTemplate,
	renderRow,
	estimateRowSize = 45,
	selectedId,
	onSelectItem,
	enableKeyboardNav = false,
	emptyState,
}: GroupedVirtualTableProps<TRow, TGroupKey>) {
	const parentRef = useRef<HTMLDivElement>(null);
	const activeStickyIndexRef = useRef(0);

	const flatItems = useMemo(
		() => buildFlatItems(items, groupBy, groupOrder),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[items, groupBy, groupOrder],
	);

	const rowItems = useMemo(
		() => flatItems.filter((f): f is RowFlatItem<TRow> => f.type === "row"),
		[flatItems],
	);

	const stickyIndexes = useMemo(
		() =>
			flatItems.reduce<number[]>((acc, item, i) => {
				if (item.type === "group-header") acc.push(i);
				return acc;
			}, []),
		[flatItems],
	);

	const table = useReactTable<TRow>({
		data: [] as TRow[],
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const virtualizer = useVirtualizer({
		count: flatItems.length,
		overscan: 10,
		getScrollElement: () => parentRef.current,
		estimateSize: (index) => {
			const item = flatItems[index];
			return item?.type === "group-header" ? estimateGroupHeaderSize : estimateRowSize;
		},
		measureElement: (el) => el.getBoundingClientRect().height,
		rangeExtractor: useCallback(
			(range: Range) => {
				activeStickyIndexRef.current =
					[...stickyIndexes].reverse().find((i) => range.startIndex >= i) ?? 0;
				const next = new Set([activeStickyIndexRef.current, ...defaultRangeExtractor(range)]);
				return [...next].sort((a, b) => a - b);
			},
			[stickyIndexes],
		),
	});

	// Scroll to selected row when selectedId changes
	const scrollToSelected = useEffectEvent((id: string) => {
		const index = flatItems.findIndex((f) => f.type === "row" && getItemId(f.item) === id);
		if (index >= 0) {
			virtualizer.scrollToIndex(index, { align: "auto" });
			requestAnimationFrame(() => document.getElementById(id)?.focus());
		}
	});

	useEffect(() => {
		if (selectedId) scrollToSelected(selectedId);
	}, [selectedId]);

	// Internal keyboard navigation (opt-in)
	const navigate = useEffectEvent((direction: "up" | "down") => {
		if (!onSelectItem || rowItems.length === 0) return;
		if (!selectedId) {
			onSelectItem(getItemId(rowItems[0].item));
			return;
		}
		const idx = rowItems.findIndex((f) => getItemId(f.item) === selectedId);
		const target = rowItems[direction === "down" ? idx + 1 : idx - 1];
		if (target) onSelectItem(getItemId(target.item));
	});

	useHotkeys("j", () => navigate("down"), { enabled: enableKeyboardNav });
	useHotkeys("k", () => navigate("up"), { enabled: enableKeyboardNav });
	useHotkeys("esc", () => onSelectItem?.(null), { enabled: enableKeyboardNav });

	if (items.length === 0) return <>{emptyState ?? null}</>;

	return (
		<div ref={parentRef} className="h-full w-full overflow-y-auto contain-strict">
			{/* Sticky column header */}
			<div
				className={cn("bg-card sticky top-0 z-20 border-b", gridTemplate)}
				style={{ height: THEAD_HEIGHT }}
			>
				{table.getHeaderGroups().map((headerGroup) =>
					headerGroup.headers.map((header) => {
						const headerClassName = header.column.columnDef.meta?.headerClassName as
							| string
							| undefined;
						return (
							<div
								key={header.id}
								className={cn(
									"text-muted-foreground flex items-center px-4 text-xs font-medium uppercase",
									headerClassName,
								)}
							>
								{flexRender(header.column.columnDef.header, header.getContext())}
							</div>
						);
					}),
				)}
			</div>

			{/* Virtualizer body */}
			<div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
				{virtualizer.getVirtualItems().map((virtualRow) => {
					const flatItem = flatItems[virtualRow.index];
					const isActiveSticky = activeStickyIndexRef.current === virtualRow.index;

					if (flatItem.type === "group-header") {
						return (
							<div
								key={virtualRow.key}
								data-index={virtualRow.index}
								ref={virtualizer.measureElement}
								style={
									isActiveSticky
										? { position: "sticky", top: THEAD_HEIGHT, zIndex: 10, width: "100%" }
										: {
												position: "absolute",
												top: 0,
												left: 0,
												width: "100%",
												transform: `translateY(${virtualRow.start}px)`,
											}
								}
							>
								{renderGroupHeader?.(flatItem.groupKey, flatItem.items)}
							</div>
						);
					}

					const id = getItemId(flatItem.item);
					const isSelected = id === selectedId;

					return (
						<div
							key={virtualRow.key}
							data-index={virtualRow.index}
							ref={virtualizer.measureElement}
							id={id}
							role="row"
							// oxlint-disable-next-line jsx_a11y/no-noninteractive-tabindex
							tabIndex={0}
							className={cn(
								"hover:bg-muted/60 focus-visible:ring-ring cursor-pointer border-b outline-none focus-visible:ring-2 focus-visible:ring-inset",
								gridTemplate,
								isSelected && "ring-ring ring-2 ring-inset",
							)}
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								transform: `translateY(${virtualRow.start}px)`,
							}}
							onClick={() => onSelectItem?.(id)}
							onKeyDown={(e) => {
								if (e.code === "Enter" || e.code === "Space") {
									e.preventDefault();
									onSelectItem?.(id);
								}
							}}
						>
							{renderRow(flatItem.item, isSelected)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

export const GroupedVirtualTable = memo(
	GroupedVirtualTableInner,
) as typeof GroupedVirtualTableInner;
