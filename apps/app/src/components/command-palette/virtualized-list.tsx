import { CommandList } from "@hoalu/ui/command";
import { cn } from "@hoalu/ui/utils";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";

import { ActionItem } from "./action-item.tsx";
import { HEADER_HEIGHT, ITEM_HEIGHT, MAX_LIST_HEIGHT, VIRTUALIZER_OVERSCAN } from "./constants.ts";
import { ExpenseItem } from "./expense-item.tsx";
import { HeaderItem } from "./header-item.tsx";
import { RecurringBillItem } from "./recurring-bill-item.tsx";

import type { AutocompleteItem, VirtualizedItem } from "./types.ts";

interface VirtualizedListProps {
	items: VirtualizedItem[];
	autocompleteItems: AutocompleteItem[];
	runAction: (action: () => void) => void;
	scrollToItemRef: React.MutableRefObject<((itemIndex: number) => void) | null>;
}

export function VirtualizedList({
	items,
	autocompleteItems,
	runAction,
	scrollToItemRef,
}: VirtualizedListProps) {
	const navigate = useNavigate();
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const parentRef = useRef<HTMLDivElement>(null);

	const virtualizer = useVirtualizer({
		count: items.length,
		getScrollElement: () => parentRef.current,
		estimateSize: (index) => (items[index].type === "header" ? HEADER_HEIGHT : ITEM_HEIGHT),
		measureElement: (el) => el.getBoundingClientRect().height,
		overscan: VIRTUALIZER_OVERSCAN,
	});

	// Expose scroll function to parent via ref
	useEffect(() => {
		scrollToItemRef.current = (itemIndex: number) => {
			// Find the virtualizedItems index that corresponds to this itemIndex
			const virtualIndex = items.findIndex(
				(item) => item.type !== "header" && item.itemIndex === itemIndex,
			);
			if (virtualIndex !== -1) {
				virtualizer.scrollToIndex(virtualIndex, { align: "auto" });
			}
		};

		return () => {
			scrollToItemRef.current = null;
		};
	}, [items, virtualizer, scrollToItemRef]);

	const virtualItems = virtualizer.getVirtualItems();
	const totalHeight = virtualizer.getTotalSize();
	const needsScroll = totalHeight > MAX_LIST_HEIGHT;

	// Add 8px extra space at the bottom when content fits naturally
	const containerHeight = needsScroll ? MAX_LIST_HEIGHT : totalHeight + 8;

	if (items.length === 0) {
		return (
			<div role="status" className="text-muted-foreground py-6 text-center text-sm">
				No results
			</div>
		);
	}

	return (
		<CommandList className="p-0!">
			<div
				ref={parentRef}
				style={{ height: containerHeight }}
				className={cn(
					"relative w-full overflow-x-hidden p-2",
					needsScroll ? "overflow-y-auto" : "overflow-y-hidden",
				)}
			>
				<div style={{ height: totalHeight }} className="relative w-full">
					{virtualItems.map((virtualRow) => {
						const item = items[virtualRow.index];

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
									transform: `translateY(${virtualRow.start}px)`,
								}}
							>
								{item.type === "header" && <HeaderItem label={item.label} />}
								{item.type === "expense" && (
									<ExpenseItem
										expense={item.data}
										autocompleteItem={autocompleteItems[item.itemIndex]}
										itemIndex={item.itemIndex}
										onClick={() =>
											runAction(() =>
												navigate({
													to: "/$slug/expenses",
													params: { slug },
													search: { id: item.data.id },
												}),
											)
										}
									/>
								)}
								{item.type === "action" && (
									<ActionItem
										action={item.data}
										autocompleteItem={autocompleteItems[item.itemIndex]}
										itemIndex={item.itemIndex}
									/>
								)}
								{item.type === "upcoming-bill" && (
									<RecurringBillItem
										bill={item.data}
										autocompleteItem={autocompleteItems[item.itemIndex]}
										itemIndex={item.itemIndex}
										onClick={() =>
											runAction(() =>
												navigate({
													to: "/$slug/recurring-bills",
													params: { slug },
												}),
											)
										}
									/>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</CommandList>
	);
}
