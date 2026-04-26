import { CurrencyValue } from "#app/components/currency-value.tsx";
import ExpenseContent from "#app/components/expenses/expense-content.tsx";
import { type SyncedExpense } from "#app/components/expenses/use-expenses.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { datetime } from "@hoalu/common/datetime";
import { Badge } from "@hoalu/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hoalu/ui/empty";
import { cn } from "@hoalu/ui/utils";
import { useNavigate, useParams } from "@tanstack/react-router";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { defaultRangeExtractor, useVirtualizer } from "@tanstack/react-virtual";
import type { Range } from "@tanstack/react-virtual";
import { memo, useCallback, useEffect, useEffectEvent, useMemo, useRef } from "react";

const THEAD_HEIGHT = 32;
const GRID_TEMPLATE =
	"grid grid-cols-[var(--expense-category-size)_1fr_var(--expense-amount-size)_var(--expense-wallet-size)]";

type ExpenseItem = {
	type: "expense";
	expense: SyncedExpense;
	date: string;
};

type GroupHeaderItem = {
	type: "group-header";
	date: string;
	total: number;
};

type VirtualItem = ExpenseItem | GroupHeaderItem;

const columns: ColumnDef<SyncedExpense>[] = [
	{ id: "category", header: "Category" },
	{ id: "title", header: "Title" },
	{
		id: "amount",
		header: "Amount",
		meta: {
			headerClassName: "justify-end",
		},
	},
	{ id: "wallet", header: "Wallet" },
];

function buildFlatItems(expenses: SyncedExpense[]): VirtualItem[] {
	const grouped = new Map<string, SyncedExpense[]>();
	expenses.forEach((expense) => {
		const existing = grouped.get(expense.date);
		if (existing) existing.push(expense);
		else grouped.set(expense.date, [expense]);
	});

	const items: VirtualItem[] = [];
	for (const [date, groupExpenses] of grouped.entries()) {
		let total = 0;
		for (const e of groupExpenses) {
			const v = e.convertedAmount;
			if (typeof v === "number" && v >= 0) total += v;
		}
		items.push({ type: "group-header", date, total });
		groupExpenses.forEach((expense) => items.push({ type: "expense", date, expense }));
	}
	return items;
}

function GroupHeader({ date, total }: Omit<GroupHeaderItem, "type">) {
	const {
		metadata: { currency: workspaceCurrency },
	} = useWorkspace();
	const isToday = datetime.format(new Date(), "yyyy-MM-dd") === date;

	return (
		<div
			data-slot="expense-group-title"
			className={cn("bg-muted flex w-full items-center border-b px-4 py-1 text-xs", GRID_TEMPLATE)}
		>
			<div className="flex items-center gap-2">
				{datetime.format(new Date(date), "E dd/MM/yyyy")}
				{isToday && <Badge className="ml-1">Today</Badge>}
			</div>
			{/* empty to fill the column */}
			<div />
			<div className="ml-auto">
				<CurrencyValue
					value={total}
					currency={workspaceCurrency}
					className="text-destructive text-sm font-semibold"
				/>
			</div>
		</div>
	);
}

function EmptyState() {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>No expenses</EmptyTitle>
				<EmptyDescription>Create your first expense to track your spending.</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}

function ExpenseList(props: { expenses: SyncedExpense[]; selectedId: string | null }) {
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const navigate = useNavigate();
	const parentRef = useRef<HTMLDivElement>(null);
	const activeStickyIndexRef = useRef(0);

	const handleSelectExpense = useCallback(
		(id: string | null) => {
			if (!id) {
				navigate({ to: "/$slug/expenses", params: { slug } });
				return;
			}
			navigate({ to: "/$slug/expenses/$expenseId", params: { slug, expenseId: id } });
		},
		[navigate, slug],
	);

	const table = useReactTable({
		data: [],
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const flattenExpenses = useMemo(() => buildFlatItems(props.expenses), [props.expenses]);

	const stickyIndexes = useMemo(
		() =>
			flattenExpenses.reduce<number[]>((acc, item, index) => {
				if (item.type === "group-header") acc.push(index);
				return acc;
			}, []),
		[flattenExpenses],
	);

	const virtualizer = useVirtualizer({
		count: flattenExpenses.length,
		overscan: 10,
		getScrollElement: () => parentRef.current,
		estimateSize: (index) => {
			const item = flattenExpenses[index];
			if (item.type === "group-header") return 32;
			return 45;
		},
		measureElement: (el) => el.getBoundingClientRect().height,
		rangeExtractor: useCallback(
			(range: Range) => {
				activeStickyIndexRef.current =
					[...stickyIndexes].reverse().find((index) => range.startIndex >= index) ?? 0;

				const next = new Set([activeStickyIndexRef.current, ...defaultRangeExtractor(range)]);

				return [...next].sort((a, b) => a - b);
			},
			[stickyIndexes],
		),
	});

	const scrollToExpense = useEffectEvent((id: string) => {
		const index = flattenExpenses.findIndex(
			(item) => item.type === "expense" && item.expense.public_id === id,
		);
		if (index >= 0) {
			virtualizer.scrollToIndex(index, { align: "auto" });
			requestAnimationFrame(() => document.getElementById(id)?.focus());
		}
	});

	useEffect(() => {
		if (props.selectedId) scrollToExpense(props.selectedId);
	}, [props.selectedId]);

	if (props.expenses.length === 0) return <EmptyState />;

	return (
		<div
			ref={parentRef}
			data-slot="expense-list-container"
			className="scrollbar-thin h-full w-full overflow-y-auto border-t contain-strict"
		>
			{/* Sticky headers */}
			<div
				className={cn("bg-card sticky top-0 z-20 border-b", GRID_TEMPLATE)}
				style={{ height: THEAD_HEIGHT }}
			>
				{table.getHeaderGroups().map((headerGroup) =>
					headerGroup.headers.map((header) => {
						const headerClassName = header.column.columnDef.meta?.headerClassName as {
							headerClassName?: string;
						};
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
					const item = flattenExpenses[virtualRow.index];
					const isActiveSticky = activeStickyIndexRef.current === virtualRow.index;

					if (item.type === "group-header") {
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
								<GroupHeader date={item.date} total={item.total} />
							</div>
						);
					}

					return (
						<div
							key={virtualRow.key}
							data-index={virtualRow.index}
							ref={virtualizer.measureElement}
							id={item.expense.public_id}
							role="row"
							className={cn(
								"hover:bg-muted/60 focus-visible:ring-ring cursor-pointer border-b outline-none focus-visible:ring-2 focus-visible:ring-inset",
								GRID_TEMPLATE,
								props.selectedId === item.expense.public_id && "ring-ring ring-2 ring-inset",
							)}
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								transform: `translateY(${virtualRow.start}px)`,
							}}
							onClick={() => handleSelectExpense(item.expense.public_id)}
							onKeyDown={(e) => {
								if (e.code === "Enter" || e.code === "Space") {
									e.preventDefault();
									handleSelectExpense(item.expense.public_id);
								}
							}}
						>
							<ExpenseContent {...item.expense} />
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default memo(ExpenseList);
