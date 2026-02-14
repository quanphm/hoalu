import { useEffect, useRef } from "react";
import { CommandList } from "@hoalu/ui/command";
import { cn } from "@hoalu/ui/utils";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";

import { ActionItem } from "./action-item.tsx";
import { HEADER_HEIGHT, ITEM_HEIGHT, MAX_LIST_HEIGHT, VIRTUALIZER_OVERSCAN } from "./constants.ts";
import { ExpenseItem } from "./expense-item.tsx";
import { HeaderItem } from "./header-item.tsx";
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
				No results.
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
						const style = { transform: `translateY(${virtualRow.start}px)` };

						if (item.type === "header") {
							return (
								<HeaderItem
									key={`header-${item.label}`}
									label={item.label}
									style={style}
								/>
							);
						}

						if (item.type === "expense") {
							const expense = item.data;
							const autocompleteItem = autocompleteItems[item.itemIndex];
							return (
								<ExpenseItem
									key={expense.id}
									expense={expense}
									autocompleteItem={autocompleteItem}
									itemIndex={item.itemIndex}
									style={style}
									onClick={() =>
										runAction(() =>
											navigate({
												to: "/$slug/expenses",
												params: { slug },
												search: { id: expense.id },
											}),
										)
									}
								/>
							);
						}

						if (item.type === "action") {
							const action = item.data;
							const autocompleteItem = autocompleteItems[item.itemIndex];
							return (
								<ActionItem
									key={action.id}
									action={action}
									autocompleteItem={autocompleteItem}
									itemIndex={item.itemIndex}
									style={style}
								/>
							);
						}

						return null;
					})}
				</div>
			</div>
		</CommandList>
	);
}
