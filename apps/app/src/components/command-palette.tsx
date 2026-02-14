import {
	createCategoryDialogAtom,
	createExpenseDialogAtom,
	createWalletDialogAtom,
} from "#app/atoms/index.ts";
import { formatCurrency } from "#app/helpers/currency.ts";
import { matchesSearch } from "#app/helpers/normalize-search.ts";
import { categoryCollectionFactory, expenseCollectionFactory } from "#app/lib/collections/index.ts";
import { datetime } from "@hoalu/common/datetime";
import { monetary } from "@hoalu/common/monetary";
import { ArrowDownIcon, ArrowUpIcon, CornerDownLeftIcon } from "@hoalu/icons/lucide";
import {
	Command,
	CommandDialog,
	CommandDialogPopup,
	CommandFooter,
	CommandInput,
	CommandItem,
	CommandList,
	CommandPanel,
	CommandShortcut,
} from "@hoalu/ui/command";
import { KbdGroup, Kbd } from "@hoalu/ui/kbd";
import { Separator } from "@hoalu/ui/separator";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function useExpenseSearch(slug: string | undefined, search: string) {
	const expenseCollection = useMemo(() => (slug ? expenseCollectionFactory(slug) : null), [slug]);
	const categoryCollection = useMemo(() => (slug ? categoryCollectionFactory(slug) : null), [slug]);

	const { data: expenses } = useLiveQuery(
		(q) => {
			if (!expenseCollection || !categoryCollection) return null;
			return q
				.from({ expense: expenseCollection })
				.leftJoin({ category: categoryCollection }, ({ expense, category }) =>
					eq(expense.category_id, category.id),
				)
				.orderBy(({ expense }) => expense.date, "desc")
				.select(({ expense, category }) => ({
					id: expense.id,
					title: expense.title,
					description: expense.description,
					amount: expense.amount,
					currency: expense.currency,
					date: expense.date,
					categoryName: category?.name,
				}));
		},
		[slug],
	);

	const filteredExpenses = useMemo(() => {
		if (!search.trim() || !expenses) return [];

		return expenses.filter((e) =>
			matchesSearch(search, {
				textFields: [e.title, e.description],
				numericFields: [e.amount],
			}),
		);
	}, [expenses, search]);

	return filteredExpenses;
}

interface CommandPaletteProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

interface ExpenseSearchResult {
	id: string;
	title: string;
	description: string | null;
	amount: number;
	currency: string;
	date: string;
	categoryName: string | undefined;
}

interface ActionItem {
	id: string;
	label: string;
	meta?: React.ReactNode;
	onAction: () => void;
}

type VirtualizedItem =
	| { type: "header"; label: string; itemIndex?: never }
	| { type: "expense"; data: ExpenseSearchResult; itemIndex: number }
	| { type: "action"; data: ActionItem; itemIndex: number };

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
	const [search, setSearch] = useState("");
	const { slug } = useParams({ from: "/_dashboard/$slug" });

	const setCreateExpenseDialog = useSetAtom(createExpenseDialogAtom);
	const setCreateWalletDialog = useSetAtom(createWalletDialogAtom);
	const setCreateCategoryDialog = useSetAtom(createCategoryDialogAtom);

	const filteredExpenses = useExpenseSearch(slug, search);
	const hasExpenseResults = filteredExpenses.length > 0;

	const runAction = useCallback(
		(action: () => void) => {
			onOpenChange(false);
			setSearch("");
			action();
		},
		[onOpenChange],
	);

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
	const autocompleteItems = useMemo(() => {
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

	// Handle keyboard navigation - scroll to highlighted item
	const handleItemHighlighted = useCallback(
		(highlightedValue: unknown, eventDetails: { reason: string }) => {
			if (eventDetails.reason === "keyboard" && highlightedValue) {
				const value = highlightedValue as { id: string };
				// Find the index of the highlighted item in autocompleteItems
				const itemIndex = autocompleteItems.findIndex((item) => item.id === value.id);
				if (itemIndex !== -1 && scrollToItemRef.current) {
					scrollToItemRef.current(itemIndex);
				}
			}
		},
		[autocompleteItems],
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
						{hasExpenseResults && (
							<span className="text-foreground">
								{filteredExpenses.length} {filteredExpenses.length === 1 ? "expense" : "expenses"}{" "}
								found
							</span>
						)}
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

const ITEM_HEIGHT = 36;
const HEADER_HEIGHT = 32;
const MAX_LIST_HEIGHT = 384; // max-h-96

function VirtualizedList({
	items,
	autocompleteItems,
	runAction,
	scrollToItemRef,
}: {
	items: VirtualizedItem[];
	autocompleteItems: Array<{ id: string; title?: string; label?: string }>;
	runAction: (action: () => void) => void;
	scrollToItemRef: React.MutableRefObject<((itemIndex: number) => void) | null>;
}) {
	const navigate = useNavigate();
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const parentRef = useRef<HTMLDivElement>(null);

	const virtualizer = useVirtualizer({
		count: items.length,
		getScrollElement: () => parentRef.current,
		estimateSize: (index) => (items[index].type === "header" ? HEADER_HEIGHT : ITEM_HEIGHT),
		overscan: 5,
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
		return <div className="text-muted-foreground py-6 text-center text-sm">No results.</div>;
	}

	return (
		<CommandList className="p-0!">
			<div
				ref={parentRef}
				style={{ height: containerHeight }}
				className={`relative w-full overflow-x-hidden p-2 ${needsScroll ? "overflow-y-auto" : "overflow-y-hidden"}`}
			>
				<div style={{ height: totalHeight }} className="relative w-full">
					{virtualItems.map((virtualRow) => {
						const item = items[virtualRow.index];

						if (item.type === "header") {
							return (
								<div
									key={`header-${item.label}`}
									data-index={virtualRow.index}
									role="presentation"
									aria-hidden="true"
									className="text-muted-foreground absolute top-0 left-0 w-full px-2 py-2 text-xs font-medium"
									style={{ transform: `translateY(${virtualRow.start}px)` }}
								>
									{item.label}
								</div>
							);
						}

						if (item.type === "expense") {
							const expense = item.data;
							const autocompleteItem = autocompleteItems[item.itemIndex];
							return (
								<CommandItem
									key={expense.id}
									value={autocompleteItem}
									index={item.itemIndex}
									className="hover:bg-foreground/10 absolute top-0 left-0 flex min-h-8 w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none"
									style={{ transform: `translateY(${virtualRow.start}px)` }}
									onClick={() =>
										runAction(() =>
											navigate({
												to: "/$slug/expenses",
												params: { slug },
												search: { id: expense.id },
											}),
										)
									}
								>
									<div className="flex flex-1 items-center justify-between gap-2 overflow-hidden">
										<div className="flex min-w-0 items-center gap-2">
											<span className="truncate">{expense.title}</span>
											<span className="text-muted-foreground shrink-0 text-xs">
												{expense.categoryName && `${expense.categoryName} · `}
												{datetime.format(expense.date, "MMM d, yyyy")}
											</span>
										</div>
										<span className="font-mono text-xs font-bold">
											{formatCurrency(
												monetary.fromRealAmount(Number(expense.amount), expense.currency),
												expense.currency,
											)}
										</span>
									</div>
								</CommandItem>
							);
						}

						if (item.type === "action") {
							const action = item.data;
							const autocompleteItem = autocompleteItems[item.itemIndex];
							return (
								<CommandItem
									key={action.id}
									value={autocompleteItem}
									index={item.itemIndex}
									className="hover:bg-foreground/10 absolute top-0 left-0 flex min-h-8 w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none"
									style={{ transform: `translateY(${virtualRow.start}px)` }}
									onClick={action.onAction}
								>
									<span className="flex-1">{action.label}</span>
									{action.meta}
								</CommandItem>
							);
						}

						return null;
					})}
				</div>
			</div>
		</CommandList>
	);
}
