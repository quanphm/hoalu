import { CurrencyValue } from "#app/components/currency-value.tsx";
import ExpenseContent from "#app/components/expenses/expense-content.tsx";
import { type SyncedExpense, useSelectedExpense } from "#app/components/expenses/use-expenses.ts";
import { useLayoutMode } from "#app/components/layouts/use-layout-mode.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { datetime } from "@hoalu/common/datetime";
import { Badge } from "@hoalu/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hoalu/ui/empty";
import { cn } from "@hoalu/ui/utils";
import { getRouteApi } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { memo, useEffect, useEffectEvent, useMemo, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";

const routeApi = getRouteApi("/_dashboard/$slug/_normal/expenses");
const MOBILE_NAV_HEIGHT = 80;

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

function GroupHeader({ date, total }: Omit<GroupHeaderItem, "type">) {
	const {
		metadata: { currency: workspaceCurrency },
	} = useWorkspace();
	const isToday = datetime.format(new Date(), "yyyy-MM-dd") === date;

	return (
		<div
			data-slot="expense-group-title"
			className="border-muted bg-muted flex items-center py-2 pr-4 pl-3 text-xs"
		>
			<div className="flex items-center gap-2">
				{datetime.format(new Date(date), "E dd/MM/yyyy")}
				{isToday && <Badge className="ml-1">Today</Badge>}
			</div>
			<div className="ml-auto">
				<CurrencyValue
					value={total}
					currency={workspaceCurrency}
					className="text-destructive font-semibold"
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

function ExpenseList(props: { expenses: SyncedExpense[] }) {
	const { id: searchById } = routeApi.useSearch();
	const { expense: selectedExpense, onSelectExpense } = useSelectedExpense();
	const { shouldUseMobileLayout } = useLayoutMode();
	const parentRef = useRef<HTMLDivElement>(null);

	const flattenExpenses = useMemo(() => {
		const grouped = new Map<string, SyncedExpense[]>();
		props.expenses.forEach((expense) => {
			const dateKey = expense.date;
			const existing = grouped.get(dateKey);
			if (existing) {
				existing.push(expense);
			} else {
				grouped.set(dateKey, [expense]);
			}
		});

		const items: VirtualItem[] = [];
		Array.from(grouped.entries()).forEach(([date, groupExpenses]) => {
			let total = 0;
			for (const e of groupExpenses) {
				const v = e.convertedAmount;
				// convertedAmount can be -1 when conversion fails — exclude negatives.
				if (typeof v === "number" && v >= 0) total += v;
			}
			items.push({ type: "group-header", date, total });
			groupExpenses.forEach((expense) => {
				items.push({ type: "expense", date, expense });
			});
		});

		return items;
	}, [props.expenses]);

	const virtualizer = useVirtualizer({
		count: flattenExpenses.length,
		overscan: 10,
		getScrollElement: () => parentRef.current,
		estimateSize: (index) => {
			const item = flattenExpenses[index];
			if (shouldUseMobileLayout) {
				return item.type === "group-header" ? 40 : 60;
			}
			return item.type === "group-header" ? 40 : 81;
		},
		// Add padding at the bottom for mobile nav bar
		paddingEnd: shouldUseMobileLayout ? MOBILE_NAV_HEIGHT : 0,
	});

	const scrollToExpense = useEffectEvent((id: string) => {
		// Find the index in the flattened list (which includes group headers)
		const index = flattenExpenses.findIndex(
			(item) => item.type === "expense" && item.expense.id === id,
		);
		if (index >= 0) {
			virtualizer.scrollToIndex(index, { align: "auto" });
			// After virtualizer scrolls, focus the element once it's rendered
			requestAnimationFrame(() => {
				const element = document.getElementById(id);
				if (element) {
					element.focus();
				}
			});
		}
	});

	const onSelectExpenseEvent = useEffectEvent((id: string | null) => {
		onSelectExpense(id);
	});

	useHotkeys(
		"j",
		() => {
			if (!selectedExpense.id) return;

			const currentIndex = props.expenses.findIndex((item) => item.id === selectedExpense.id);
			const nextIndex = currentIndex + 1;
			const nextRowData = props.expenses[nextIndex];

			if (!nextRowData) return;

			onSelectExpenseEvent(nextRowData.id);
			scrollToExpense(nextRowData.id);
		},
		[selectedExpense.id, props.expenses],
	);

	useHotkeys(
		"k",
		() => {
			if (!selectedExpense.id) return;

			const currentIndex = props.expenses.findIndex((item) => item.id === selectedExpense.id);
			const prevIndex = currentIndex - 1;
			const prevRowData = props.expenses[prevIndex];

			if (!prevRowData) return;

			onSelectExpenseEvent(prevRowData.id);
			scrollToExpense(prevRowData.id);
		},
		[selectedExpense.id, props.expenses],
	);

	// Auto-scroll to the selected expense when it changes (e.g. from URL ?id= param)
	useEffect(() => {
		if (!searchById) return;
		const index = flattenExpenses.findIndex(
			(item) => item.type === "expense" && item.expense.id === searchById,
		);
		if (index >= 0) {
			virtualizer.scrollToIndex(index, { align: "center" });
		}
	}, [searchById, flattenExpenses, virtualizer]);

	useEffect(() => {
		return () => {
			onSelectExpenseEvent(null);
		};
	}, []);

	useHotkeys("esc", () => onSelectExpenseEvent(null), []);

	if (props.expenses.length === 0) {
		return <EmptyState />;
	}

	const virtualExpenses = virtualizer.getVirtualItems();

	return (
		<div
			ref={parentRef}
			data-slot="expense-list-container"
			className={cn(
				"scrollbar-thin h-full w-full overflow-y-auto contain-strict",
				shouldUseMobileLayout ? "" : "rounded-tl-lg border-t border-l",
			)}
		>
			<div style={{ height: `${virtualizer.getTotalSize()}px` }} className="relative w-full">
				<div
					style={{
						transform: `translateY(${virtualExpenses[0]?.start ?? 0}px)`,
					}}
					className="absolute top-0 left-0 w-full"
				>
					{virtualExpenses.map((virtualRow) => {
						const expense = flattenExpenses[virtualRow.index];
						return (
							<div key={virtualRow.key} data-index={virtualRow.index}>
								{expense.type === "group-header" ? (
									<GroupHeader date={expense.date} total={expense.total} />
								) : (
									<ExpenseContent {...expense.expense} onClick={onSelectExpense} />
								)}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

export default memo(ExpenseList);
