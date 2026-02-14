import {
	createCategoryDialogAtom,
	createExpenseDialogAtom,
	createWalletDialogAtom,
} from "#app/atoms/index.ts";
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

import type { ActionItem, AutocompleteItem, VirtualizedItem } from "./types.ts";
import { useExpenseSearch } from "./use-expense-search.ts";
import { VirtualizedList } from "./virtualized-list.tsx";

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

	const filteredExpenses = useExpenseSearch(slug, search);
	const hasExpenseResults = filteredExpenses.length > 0;

	// Use ref pattern for stable callback (rerender-defer-reads)
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

	// Build unified items array for virtualization
	// itemIndex tracks the index in autocompleteItems (excludes headers)
	const virtualizedItems: VirtualizedItem[] = useMemo(() => {
		const items: VirtualizedItem[] = [];
		let itemIndex = 0;

		// Add expenses section if there are results
		if (hasExpenseResults) {
			items.push({ type: "header", label: "Expenses" });
			for (const expense of filteredExpenses) {
				items.push({ type: "expense", data: expense, itemIndex });
				itemIndex++;
			}
		}

		// Always add actions section
		items.push({ type: "header", label: "Actions" });
		for (const action of actions) {
			items.push({ type: "action", data: action, itemIndex });
			itemIndex++;
		}

		return items;
	}, [hasExpenseResults, filteredExpenses, actions]);

	// Build items array for base-ui Autocomplete (only actual selectable items, not headers)
	const autocompleteItems: AutocompleteItem[] = useMemo(() => {
		const expenseItems = filteredExpenses.map((e) => ({
			id: e.id,
			title: e.title,
			amount: e.amount,
		}));
		const actionItems = actions.map((a) => ({ id: a.id, label: a.label }));
		return [...expenseItems, ...actionItems];
	}, [filteredExpenses, actions]);

	// Ref to hold the scroll function from VirtualizedList
	const scrollToItemRef = useRef<((itemIndex: number) => void) | null>(null);

	// Use ref to avoid recreating callback on autocompleteItems changes (rerender-defer-reads)
	const autocompleteItemsRef = useRef(autocompleteItems);
	useEffect(() => {
		autocompleteItemsRef.current = autocompleteItems;
	}, [autocompleteItems]);

	// Handle keyboard navigation - scroll to highlighted item
	const handleItemHighlighted = useCallback(
		(highlightedValue: unknown, eventDetails: { reason: string }) => {
			if (eventDetails.reason === "keyboard" && highlightedValue) {
				const value = highlightedValue as AutocompleteItem;
				// Find the index of the highlighted item in autocompleteItems
				const itemIndex = autocompleteItemsRef.current.findIndex((item) => item.id === value.id);
				if (itemIndex !== -1 && scrollToItemRef.current) {
					scrollToItemRef.current(itemIndex);
				}
			}
		},
		[],
	);

	return (
		<CommandDialog
			open={open}
			onOpenChange={(openState) => {
				onOpenChange(openState);
				if (!openState) setSearch("");
			}}
		>
			<CommandDialogPopup>
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
						/>
					</CommandPanel>

					<CommandFooter>
						<div className="flex items-center gap-3" aria-live="polite">
							{hasExpenseResults && (
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
