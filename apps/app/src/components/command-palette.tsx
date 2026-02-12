import {
	createCategoryDialogAtom,
	createExpenseDialogAtom,
	createWalletDialogAtom,
} from "#app/atoms/index.ts";
import { formatCurrency } from "#app/helpers/currency.ts";
import { normalizeSearch } from "#app/helpers/normalize-search.ts";
import { categoryCollectionFactory, expenseCollectionFactory } from "#app/lib/collections/index.ts";
import { listWorkspacesOptions } from "#app/services/query-options.ts";
import { datetime } from "@hoalu/common/datetime";
import { monetary } from "@hoalu/common/monetary";
import { CirclePlusIcon, SearchIcon } from "@hoalu/icons/lucide";
import {
	Command,
	CommandCollection,
	CommandDialog,
	CommandDialogPopup,
	CommandEmpty,
	CommandGroup,
	CommandGroupLabel,
	CommandInput,
	CommandItem,
	CommandList,
	CommandPanel,
	CommandSeparator,
} from "@hoalu/ui/command";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { Fragment, useCallback, useMemo, useState } from "react";

interface CommandPaletteProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

interface CommandPaletteItem {
	id: string;
	label: string;
	icon?: React.ReactNode;
	meta?: React.ReactNode;
	onAction: () => void;
}

interface CommandPaletteGroup {
	value: string;
	items: CommandPaletteItem[];
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
	const [search, setSearch] = useState("");
	const navigate = useNavigate();
	const params = useParams({ strict: false });
	const slug = params.slug as string | undefined;
	const { data: workspaces } = useQuery(listWorkspacesOptions());

	const setCreateExpenseDialog = useSetAtom(createExpenseDialogAtom);
	const setCreateWalletDialog = useSetAtom(createWalletDialogAtom);
	const setCreateCategoryDialog = useSetAtom(createCategoryDialogAtom);

	const close = useCallback(() => {
		onOpenChange(false);
		setSearch("");
	}, [onOpenChange]);

	const runAction = useCallback(
		(action: () => void) => {
			close();
			action();
		},
		[close],
	);

	const quickActions: CommandPaletteItem[] = useMemo(() => {
		if (!slug) return [];
		return [
			{
				id: "create-expense",
				label: "Create Expense",
				icon: <CirclePlusIcon />,
				onAction: () => runAction(() => setCreateExpenseDialog({ state: true })),
			},
			{
				id: "create-wallet",
				label: "Create Wallet",
				icon: <CirclePlusIcon />,
				onAction: () => runAction(() => setCreateWalletDialog({ state: true })),
			},
			{
				id: "create-category",
				label: "Create Category",
				icon: <CirclePlusIcon />,
				onAction: () => runAction(() => setCreateCategoryDialog({ state: true })),
			},
		];
	}, [slug, runAction, setCreateExpenseDialog, setCreateWalletDialog, setCreateCategoryDialog]);

	const workspaceItems: CommandPaletteItem[] = useMemo(() => {
		if (!workspaces || workspaces.length <= 1) return [];
		return workspaces.map((ws, index) => ({
			id: `workspace-${ws.id}`,
			label: ws.name,
			icon: (
				<span className="flex size-5 items-center justify-center rounded border text-xs font-medium">
					{index + 1}
				</span>
			),
			meta:
				ws.slug === slug ? (
					<span className="text-muted-foreground ml-1 text-xs">(current)</span>
				) : undefined,
			onAction: () => runAction(() => navigate({ to: "/$slug", params: { slug: ws.slug } })),
		}));
	}, [workspaces, slug, runAction, navigate]);

	const groups: CommandPaletteGroup[] = useMemo(() => {
		const result: CommandPaletteGroup[] = [];
		if (quickActions.length > 0) {
			result.push({ value: "Quick Actions", items: quickActions });
		}
		if (workspaceItems.length > 0) {
			result.push({ value: "Workspaces", items: workspaceItems });
		}
		return result;
	}, [quickActions, workspaceItems]);

	return (
		<CommandDialog
			open={open}
			onOpenChange={(openState) => {
				onOpenChange(openState);
				if (!openState) setSearch("");
			}}
		>
			<CommandDialogPopup>
				<Command items={groups} value={search} onValueChange={(value) => setSearch(value)}>
					<CommandInput placeholder="Search expenses..." />
					<CommandPanel>
						<CommandEmpty>No results found.</CommandEmpty>

						{slug && (
							<ExpenseSearchResults
								slug={slug}
								search={search}
								onAction={runAction}
								navigate={navigate}
							/>
						)}

						<CommandList>
							{(group, groupIndex) => (
								<Fragment key={group.value}>
									<CommandGroup items={group.items}>
										<CommandGroupLabel>{group.value}</CommandGroupLabel>
										<CommandCollection>
											{(item) => (
												<CommandItem key={item.id} value={item.id} onClick={item.onAction}>
													{item.icon}
													<span>{item.label}</span>
													{item.meta}
												</CommandItem>
											)}
										</CommandCollection>
									</CommandGroup>
									{groupIndex < groups.length - 1 && <CommandSeparator />}
								</Fragment>
							)}
						</CommandList>
					</CommandPanel>
				</Command>
			</CommandDialogPopup>
		</CommandDialog>
	);
}

function ExpenseSearchResults({
	slug,
	search,
	onAction,
	navigate,
}: {
	slug: string;
	search: string;
	onAction: (action: () => void) => void;
	navigate: ReturnType<typeof useNavigate>;
}) {
	const expenseCollection = useMemo(() => expenseCollectionFactory(slug), [slug]);
	const categoryCollection = useMemo(() => categoryCollectionFactory(slug), [slug]);

	const { data: expenses } = useLiveQuery(
		(q) => {
			return q
				.from({ expense: expenseCollection })
				.leftJoin({ category: categoryCollection }, ({ expense, category }) =>
					eq(expense.category_id, category.id),
				)
				.orderBy(({ expense }) => expense.date, "desc")
				.select(({ expense, category }) => ({
					id: expense.id,
					title: expense.title,
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
		const needle = normalizeSearch(search);
		return expenses.filter((e) => normalizeSearch(e.title).includes(needle));
	}, [expenses, search]);

	if (!filteredExpenses.length) return null;

	return (
		<div data-slot="command-expense-results">
			<CommandSeparator />
			<div className="p-2">
				<p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">Expenses</p>
				{filteredExpenses.map((expense) => (
					<button
						key={expense.id}
						type="button"
						className="data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground hover:bg-accent flex min-h-8 w-full cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none"
						onClick={() => onAction(() => navigate({ to: "/$slug/expenses", params: { slug } }))}
					>
						<SearchIcon className="text-muted-foreground mr-2 size-4 shrink-0" />
						<div className="flex flex-1 items-center justify-between gap-2 overflow-hidden">
							<span className="truncate">{expense.title}</span>
							<div className="flex shrink-0 items-center gap-2">
								{expense.categoryName && (
									<span className="text-muted-foreground text-xs">{expense.categoryName}</span>
								)}
								<span className="font-mono text-xs">
									{formatCurrency(
										monetary.fromRealAmount(Number(expense.amount), expense.currency),
										expense.currency,
									)}
								</span>
								<span className="text-muted-foreground text-xs">
									{datetime.format(expense.date, "MMM d")}
								</span>
							</div>
						</div>
					</button>
				))}
			</div>
		</div>
	);
}
