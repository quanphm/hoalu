import {
	createCategoryDialogAtom,
	createExpenseDialogAtom,
	createWalletDialogAtom,
} from "#app/atoms/index.ts";
import { useUpcomingBills } from "#app/components/upcoming-bills/use-upcoming-bills.ts";
import { ArrowDownIcon, ArrowUpIcon, CornerDownLeftIcon } from "@hoalu/icons/lucide";
import {
	Command,
	CommandDialog,
	CommandDialogPopup,
	CommandFooter,
	CommandInput,
	CommandPanel,
	CommandShortcut,
} from "@hoalu/ui/command";
import { Kbd, KbdGroup } from "@hoalu/ui/kbd";
import { Separator } from "@hoalu/ui/separator";
import { useParams } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useExpenseSearch } from "./use-expense-search.ts";
import { VirtualizedList } from "./virtualized-list.tsx";

import type { ActionItem, AutocompleteItem, UpcomingBillItem, VirtualizedItem } from "./types.ts";

interface CommandPaletteProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
	const [search, setSearch] = useState("");
	const { slug } = useParams({ from: "/_dashboard/$slug" });

	const setCreateExpenseDialog = useSetAtom(createExpenseDialogAtom);
	const setCreateWalletDialog = useSetAtom(createWalletDialogAtom);
	const setCreateCategoryDialog = useSetAtom(createCategoryDialogAtom);

	const { filtered: filteredExpenses, recent: recentExpenses } = useExpenseSearch(
		open ? slug : undefined,
		search,
	);
	const isSearching = search.trim().length > 0;
	const hasSearchResults = isSearching && filteredExpenses.length > 0;
	const hasRecentExpenses = !isSearching && recentExpenses.length > 0;

	const allUpcomingBills = useUpcomingBills();
	const upcomingBills: UpcomingBillItem[] = allUpcomingBills.slice(0, 3).map((b) => ({
		recurringBillId: b.recurringBillId,
		date: b.date,
		title: b.title,
		amount: b.amount,
		currency: b.currency,
		walletName: b.walletName,
		categoryName: b.categoryName,
		categoryColor: b.categoryColor as UpcomingBillItem["categoryColor"],
	}));
	const hasUpcomingBills = !isSearching && upcomingBills.length > 0;

	const onOpenChangeRef = useRef(onOpenChange);
	useEffect(() => {
		onOpenChangeRef.current = onOpenChange;
	}, [onOpenChange]);

	const runAction = useCallback((action: () => void) => {
		onOpenChangeRef.current(false);
		setSearch("");
		action();
	}, []);

	const actions: ActionItem[] = useMemo(
		() => [
			{
				id: "create-expense",
				label: "Create Expense",
				onAction: () => runAction(() => setCreateExpenseDialog({ state: true })),
				meta: <CommandShortcut>⇧E</CommandShortcut>,
			},
			{
				id: "create-wallet",
				label: "Create Wallet",
				onAction: () => runAction(() => setCreateWalletDialog({ state: true })),
				meta: <CommandShortcut>⇧W</CommandShortcut>,
			},
			{
				id: "create-category",
				label: "Create Category",
				onAction: () => runAction(() => setCreateCategoryDialog({ state: true })),
				meta: <CommandShortcut>⇧C</CommandShortcut>,
			},
		],
		[runAction, setCreateExpenseDialog, setCreateWalletDialog, setCreateCategoryDialog],
	);

	const virtualizedItems: VirtualizedItem[] = useMemo(() => {
		const items: VirtualizedItem[] = [];
		let itemIndex = 0;

		if (hasSearchResults) {
			items.push({ type: "header", label: "Expenses" });
			for (const expense of filteredExpenses) {
				items.push({ type: "expense", data: expense, itemIndex });
				itemIndex++;
			}
		} else if (hasRecentExpenses) {
			items.push({ type: "header", label: "Recent expenses" });
			for (const expense of recentExpenses) {
				items.push({ type: "expense", data: expense, itemIndex });
				itemIndex++;
			}
		}

		if (hasUpcomingBills) {
			// Upcoming bills
			items.push({ type: "header", label: "Upcoming bills" });
			for (const bill of upcomingBills) {
				items.push({ type: "upcoming-bill", data: bill, itemIndex });
				itemIndex++;
			}
		}

		if (!hasSearchResults) {
			// Actions section
			items.push({ type: "header", label: "Actions" });
			for (const action of actions) {
				items.push({ type: "action", data: action, itemIndex });
				itemIndex++;
			}
		}

		return items;
	}, [
		hasSearchResults,
		filteredExpenses,
		hasRecentExpenses,
		recentExpenses,
		hasUpcomingBills,
		upcomingBills,
		actions,
	]);

	// Build items array for base-ui Autocomplete (only actual selectable items, not headers)
	// Order must match virtualizedItems (excluding headers) for correct itemIndex mapping
	const autocompleteItems: AutocompleteItem[] = useMemo(() => {
		const expenseItems = hasSearchResults
			? filteredExpenses.map((e) => ({ id: e.id, title: e.title, amount: e.amount }))
			: hasRecentExpenses
				? recentExpenses.map((e) => ({ id: e.id, title: e.title, amount: e.amount }))
				: [];
		const billItems = hasUpcomingBills
			? upcomingBills.map((b) => ({ id: b.recurringBillId, title: b.title }))
			: [];
		// Exclude actions from keyboard nav when searching — they aren't rendered in the virtual list
		const actionItems = !hasSearchResults ? actions.map((a) => ({ id: a.id, label: a.label })) : [];
		return [...expenseItems, ...billItems, ...actionItems];
	}, [
		hasSearchResults,
		filteredExpenses,
		hasRecentExpenses,
		recentExpenses,
		hasUpcomingBills,
		upcomingBills,
		actions,
	]);

	// Ref to hold the scroll function from VirtualizedList
	const scrollToItemRef = useRef<((itemIndex: number) => void) | null>(null);
	const scrollContainerRef = useRef<HTMLDivElement | null>(null);
	const highlightedIndexRef = useRef<number>(-1);

	// Use ref to avoid recreating callback on autocompleteItems changes (rerender-defer-reads)
	const autocompleteItemsRef = useRef(autocompleteItems);
	useEffect(() => {
		autocompleteItemsRef.current = autocompleteItems;
	}, [autocompleteItems]);

	const handleItemHighlighted = useCallback((highlightedValue: unknown) => {
		if (!highlightedValue) {
			highlightedIndexRef.current = -1;
			return;
		}
		// highlightedValue is the full AutocompleteItem object from the items array
		const id = (highlightedValue as { id?: string }).id;
		const idx = autocompleteItemsRef.current.findIndex((item) => item.id === id);
		highlightedIndexRef.current = idx;
	}, []);

	// Fires in capture phase — before base-ui processes the arrow key.
	// Scrolls the virtual list to show the wrap target before the highlight moves.
	const handleWrapScroll = useCallback((e: React.KeyboardEvent) => {
		if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
		const container = scrollContainerRef.current;
		if (!container) return;
		const total = autocompleteItemsRef.current.length;
		if (total === 0) return;
		const idx = highlightedIndexRef.current;
		if (e.key === "ArrowUp" && idx === 0) {
			container.scrollTop = container.scrollHeight;
		} else if (e.key === "ArrowDown" && idx === total - 1) {
			container.scrollTop = 0;
		}
	}, []);

	return (
		<CommandDialog
			open={open}
			onOpenChange={(openState) => {
				onOpenChange(openState);
				if (!openState) setSearch("");
			}}
		>
			<CommandDialogPopup className="max-w-2xl" onKeyDownCapture={handleWrapScroll}>
				<Command
					items={autocompleteItems}
					value={search}
					onValueChange={(value) => setSearch(value)}
					virtualized
					mode="none"
					onItemHighlighted={handleItemHighlighted}
				>
					<CommandInput placeholder="Search..." />
					<CommandPanel>
						<VirtualizedList
							items={virtualizedItems}
							autocompleteItems={autocompleteItems}
							runAction={runAction}
							scrollToItemRef={scrollToItemRef}
							scrollContainerRef={scrollContainerRef}
						/>
					</CommandPanel>

					<CommandFooter>
						<div className="flex items-center gap-3" aria-live="polite">
							{hasSearchResults && (
								<span className="text-foreground">
									{filteredExpenses.length} {filteredExpenses.length === 1 ? "expense" : "expenses"}{" "}
									found
								</span>
							)}
						</div>
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-1">
								<KbdGroup aria-hidden="true">
									<Kbd className="bg-background text-foreground">
										<ArrowUpIcon />
									</Kbd>
									<Kbd className="bg-background text-foreground">
										<ArrowDownIcon />
									</Kbd>
								</KbdGroup>
								<span>Navigate</span>
							</div>
							<div className="flex items-center gap-1">
								<Kbd className="bg-background text-foreground" aria-hidden="true">
									<CornerDownLeftIcon />
								</Kbd>
								<span>Open</span>
							</div>
							<Separator orientation="vertical" className="h-4!" />
							<div className="flex items-center gap-1">
								<Kbd className="bg-background text-foreground" aria-hidden="true">
									Esc
								</Kbd>
								<span>Close</span>
							</div>
						</div>
					</CommandFooter>
				</Command>
			</CommandDialogPopup>
		</CommandDialog>
	);
}
