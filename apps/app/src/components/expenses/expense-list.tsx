import { CurrencyValue } from "#app/components/currency-value.tsx";
import ExpenseContent from "#app/components/expenses/expense-content.tsx";
import { type SyncedTransaction } from "#app/components/transactions/use-transactions.ts";
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
	"grid grid-cols-[var(--category-size)_1fr_var(--amount-size)_var(--amount-size)_var(--wallet-size)]";

type TransactionItem = {
	type: "transaction";
	transaction: SyncedTransaction;
	date: string;
};

type GroupHeaderItem = {
	type: "group-header";
	date: string;
	expenseTotal: number;
	incomeTotal: number;
};

type VirtualItem = TransactionItem | GroupHeaderItem;

const columns: ColumnDef<SyncedTransaction>[] = [
	{ id: "category", header: "Category" },
	{ id: "title", header: "Title" },
	{
		id: "expense-amount",
		header: "Expense",
		meta: {
			headerClassName: "justify-end",
		},
	},
	{
		id: "income-amount",
		header: "Income",
		meta: {
			headerClassName: "justify-end",
		},
	},
	{ id: "wallet", header: "Wallet" },
];

function buildFlatItems(transactions: SyncedTransaction[]): VirtualItem[] {
	const grouped = new Map<string, SyncedTransaction[]>();
	for (const tx of transactions) {
		const existing = grouped.get(tx.date);
		if (existing) existing.push(tx);
		else grouped.set(tx.date, [tx]);
	}

	const items: VirtualItem[] = [];
	for (const [date, group] of grouped.entries()) {
		let expenseTotal = 0;
		let incomeTotal = 0;
		for (const tx of group) {
			const v = tx.convertedAmount;
			if (typeof v === "number" && v >= 0) {
				if (tx.kind === "expense") expenseTotal += v;
				else incomeTotal += v;
			}
		}
		items.push({ type: "group-header", date, expenseTotal, incomeTotal });
		for (const tx of group) items.push({ type: "transaction", date, transaction: tx });
	}
	return items;
}

function GroupHeader({ date, expenseTotal, incomeTotal }: Omit<GroupHeaderItem, "type">) {
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
			{/* empty to fill title column */}
			<div />
			<div className="ml-auto flex items-center gap-3">
				{expenseTotal > 0 && (
					<CurrencyValue
						value={expenseTotal}
						currency={workspaceCurrency}
						prefix="-"
						className="text-destructive text-sm font-semibold"
					/>
				)}
			</div>
			<div className="ml-auto flex items-center gap-3">
				{incomeTotal > 0 && (
					<CurrencyValue
						value={incomeTotal}
						currency={workspaceCurrency}
						prefix="+"
						className="text-success text-sm font-semibold"
					/>
				)}
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

function ExpenseList(props: { expenses: SyncedTransaction[]; selectedId: string | null }) {
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const navigate = useNavigate();
	const parentRef = useRef<HTMLDivElement>(null);
	const activeStickyIndexRef = useRef(0);

	const handleSelectTransaction = useCallback(
		(id: string | null) => {
			if (!id) {
				navigate({ to: "/$slug/transactions", params: { slug } });
				return;
			}
			navigate({ to: "/$slug/transactions/$transactionId", params: { slug, transactionId: id } });
		},
		[navigate, slug],
	);

	const table = useReactTable({
		data: [],
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const flatItems = useMemo(() => buildFlatItems(props.expenses), [props.expenses]);

	const stickyIndexes = useMemo(
		() =>
			flatItems.reduce<number[]>((acc, item, index) => {
				if (item.type === "group-header") acc.push(index);
				return acc;
			}, []),
		[flatItems],
	);

	const virtualizer = useVirtualizer({
		count: flatItems.length,
		overscan: 10,
		getScrollElement: () => parentRef.current,
		estimateSize: (index) => {
			const item = flatItems[index];
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

	const scrollToTransaction = useEffectEvent((id: string) => {
		const index = flatItems.findIndex(
			(item) => item.type === "transaction" && item.transaction.public_id === id,
		);
		if (index >= 0) {
			virtualizer.scrollToIndex(index, { align: "auto" });
			requestAnimationFrame(() => document.getElementById(id)?.focus());
		}
	});

	useEffect(() => {
		if (props.selectedId) scrollToTransaction(props.selectedId);
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
					const item = flatItems[virtualRow.index];
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
								<GroupHeader
									date={item.date}
									expenseTotal={item.expenseTotal}
									incomeTotal={item.incomeTotal}
								/>
							</div>
						);
					}

					const tx = item.transaction;
					return (
						<div
							key={virtualRow.key}
							data-index={virtualRow.index}
							ref={virtualizer.measureElement}
							id={tx.public_id}
							role="row"
							className={cn(
								"hover:bg-muted/60 focus-visible:ring-ring cursor-pointer border-b outline-none focus-visible:ring-2 focus-visible:ring-inset",
								GRID_TEMPLATE,
								props.selectedId === tx.public_id && "ring-ring ring-2 ring-inset",
							)}
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								transform: `translateY(${virtualRow.start}px)`,
							}}
							onClick={() => handleSelectTransaction(tx.public_id)}
							onKeyDown={(e) => {
								if (e.code === "Enter" || e.code === "Space") {
									e.preventDefault();
									handleSelectTransaction(tx.public_id);
								}
							}}
						>
							<ExpenseContent {...tx} />
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default memo(ExpenseList);
