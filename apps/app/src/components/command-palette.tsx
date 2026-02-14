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
import { ArrowDownIcon, ArrowUpIcon, CornerDownLeftIcon, PlusIcon } from "@hoalu/icons/lucide";
import {
	Command,
	CommandCollection,
	CommandDialog,
	CommandDialogPopup,
	CommandEmpty,
	CommandFooter,
	CommandGroup,
	CommandGroupLabel,
	CommandInput,
	CommandItem,
	CommandList,
	CommandPanel,
	CommandSeparator,
	CommandShortcut,
} from "@hoalu/ui/command";
import { KbdGroup, Kbd } from "@hoalu/ui/kbd";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useSetAtom } from "jotai";
import { useCallback, useMemo, useRef, useState } from "react";

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

interface CommandPaletteGroup {
	value: string;
	items:
		| {
				id: string;
				label: string;
				icon?: React.ReactNode;
				meta?: React.ReactNode;
				onAction?: () => void;
		  }[]
		| ExpenseSearchResult[];
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

	const actionsGroup: CommandPaletteGroup = {
		value: "Actions",
		items: [
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
	};
	const expensesGroup: CommandPaletteGroup = {
		value: "Expenses",
		items: filteredExpenses,
	};

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
					virtualized
					items={[expensesGroup, actionsGroup]}
					value={search}
					onValueChange={(value) => setSearch(value)}
				>
					<CommandInput placeholder="Search..." />
					<CommandPanel>
						{!hasExpenseResults && <CommandEmpty>No results.</CommandEmpty>}
						<CommandList>
							{hasExpenseResults && (
								<CommandGroup items={expensesGroup.items}>
									<CommandGroupLabel>{expensesGroup.value}</CommandGroupLabel>
									<VirtualizedExpenses data={filteredExpenses} onItemClick={runAction} />
								</CommandGroup>
							)}
							<CommandGroup items={actionsGroup.items}>
								<CommandGroupLabel>{actionsGroup.value}</CommandGroupLabel>
								<CommandCollection>
									{(item) => (
										<CommandItem key={item.id} value={item.id} onClick={item.onAction}>
											<span className="flex-1">{item.label}</span>
											{item.meta}
										</CommandItem>
									)}
								</CommandCollection>
							</CommandGroup>
						</CommandList>
					</CommandPanel>

					<CommandFooter>
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2">
								<KbdGroup>
									<Kbd className="bg-background text-foreground">
										<ArrowUpIcon />
									</Kbd>
									<Kbd className="bg-background text-foreground">
										<ArrowDownIcon />
									</Kbd>
								</KbdGroup>
								<span>Navigate</span>
							</div>
							<div className="flex items-center gap-2">
								<Kbd className="bg-background text-foreground">
									<CornerDownLeftIcon />
								</Kbd>
								<span>Open</span>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Kbd className="bg-background text-foreground">Esc</Kbd>
							<span>Close</span>
						</div>
					</CommandFooter>
				</Command>
			</CommandDialogPopup>
		</CommandDialog>
	);
}

const EXPENSE_ITEM_HEIGHT = 36;

function VirtualizedExpenses({
	data,
	onItemClick,
}: {
	data: ExpenseSearchResult[];
	onItemClick: (action: () => void) => void;
}) {
	const navigate = useNavigate();
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const parentRef = useRef<HTMLDivElement>(null);

	const virtualizer = useVirtualizer({
		count: data.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => EXPENSE_ITEM_HEIGHT,
		overscan: 5,
		measureElement: (element) => element.getBoundingClientRect().height,
	});
	const virtualItems = virtualizer.getVirtualItems();

	return (
		<div ref={parentRef} className="max-h-96 overflow-y-auto">
			<div style={{ height: `${virtualizer.getTotalSize()}px` }} className="relative w-full">
				{virtualItems.map((virtualRow) => {
					const expense = data[virtualRow.index];
					if (!expense) {
						return null;
					}
					return (
						<CommandItem
							key={expense.id}
							ref={virtualizer.measureElement}
							data-index={virtualRow.index}
							className="hover:bg-foreground/10 flex min-h-8 w-full cursor-default items-center rounded-sm text-sm outline-none select-none"
							onClick={() =>
								onItemClick(() =>
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
				})}
			</div>
		</div>
	);
}
