import { useVirtualizer } from "@tanstack/react-virtual";
import { memo, useEffect, useEffectEvent, useMemo, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { datetime } from "@hoalu/common/datetime";
import { Badge } from "@hoalu/ui/badge";

import { CurrencyValue } from "#app/components/currency-value.tsx";
import ExpenseContent from "#app/components/expenses/expense-content.tsx";
import { type SyncedExpense, useSelectedExpense } from "#app/components/expenses/use-expenses.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";

type ExpenseItem = {
	type: "expense";
	expense: SyncedExpense;
	date: string;
};

type GroupHeaderItem = {
	type: "group-header";
	date: string;
	expenses: SyncedExpense[];
};

type VirtualItem = ExpenseItem | GroupHeaderItem;

function GroupHeader({ date, expenses }: Omit<GroupHeaderItem, "type">) {
	const isToday = datetime.format(new Date(), "yyyy-MM-dd") === date;

	return (
		<div
			data-slot="expense-group-title"
			className="flex items-center border-muted bg-muted py-2 pr-6 pl-3 text-xs"
		>
			<div className="flex items-center gap-1 font-semibold">
				{datetime.format(new Date(date), "E dd/MM/yyyy")}
				{isToday && (
					<Badge variant="secondary" className="ml-1">
						today
					</Badge>
				)}
			</div>
			<div className="ml-auto">
				<TotalExpenseByDate data={expenses} />
			</div>
		</div>
	);
}

function EmptyState() {
	return (
		<p className="mx-4 rounded-lg bg-muted p-4 text-center text-base text-muted-foreground">
			No expenses found
		</p>
	);
}

function TotalExpenseByDate(props: { data: SyncedExpense[] }) {
	const {
		metadata: { currency: workspaceCurrency },
	} = useWorkspace();
	const total = props.data.reduce((sum, current) => {
		const value = current.convertedAmount;
		// convertedAmount can be -1 when conversion fails (see expenses query).
		// Exclude negatives from the total.
		return sum + (typeof value === "number" && value >= 0 ? value : 0);
	}, 0);

	return (
		<CurrencyValue
			value={total}
			currency={workspaceCurrency}
			className="font-semibold text-destructive"
		/>
	);
}

function ExpenseList(props: { data: SyncedExpense[] }) {
	const { expense: selectedExpense, onSelectExpense } = useSelectedExpense();
	const parentRef = useRef<HTMLDivElement>(null);

	const focusExpense = useEffectEvent((id: string) => {
		requestAnimationFrame(() => {
			const element = document.getElementById(id);
			if (element) {
				element.focus();
				element.scrollIntoView({ block: "nearest", behavior: "smooth" });
			}
		});
	});

	const flattenExpenses = useMemo(() => {
		const grouped = new Map<string, SyncedExpense[]>();
		props.data.forEach((expense) => {
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
			items.push({
				type: "group-header",
				date,
				expenses: groupExpenses,
			});
			groupExpenses.forEach((expense) => {
				items.push({
					type: "expense",
					date,
					expense,
				});
			});
		});

		return items;
	}, [props.data]);

	const virtualizer = useVirtualizer({
		count: flattenExpenses.length,
		overscan: 5,
		getScrollElement: () => parentRef.current,
		estimateSize: (index) => {
			const item = flattenExpenses[index];
			return item.type === "group-header" ? 38 : 78;
		},
	});

	const onSelectExpenseEvent = useEffectEvent((id: string | null) => {
		onSelectExpense(id);
	});

	useHotkeys("j", () => {
		if (!selectedExpense.id) return;

		const currentIndex = props.data.findIndex((item) => item.id === selectedExpense.id);
		const nextIndex = currentIndex + 1;
		const nextRowData = props.data[nextIndex];

		if (!nextRowData) return;

		onSelectExpenseEvent(nextRowData.id);
		focusExpense(nextRowData.id);
	}, [selectedExpense]);

	useHotkeys("k", () => {
		if (!selectedExpense.id) return;

		const currentIndex = props.data.findIndex((item) => item.id === selectedExpense.id);
		const prevIndex = currentIndex - 1;
		const prevRowData = props.data[prevIndex];

		if (!prevRowData) return;

		onSelectExpenseEvent(prevRowData.id);
		focusExpense(prevRowData.id);
	}, [selectedExpense.id, props.data]);

	useEffect(() => {
		return () => {
			onSelectExpenseEvent(null);
		};
	}, []);

	useHotkeys("esc", () => onSelectExpenseEvent(null), []);

	if (props.data.length === 0) {
		return <EmptyState />;
	}

	const virtualExpenses = virtualizer.getVirtualItems();

	return (
		<div
			ref={parentRef}
			data-slot="expense-list-container"
			className="scrollbar-thin h-full w-full overflow-y-auto rounded-tl-lg border-t border-l contain-strict"
		>
			<div
				style={{
					height: `${virtualizer.getTotalSize()}px`,
				}}
				className="relative w-full"
			>
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
									<GroupHeader date={expense.date} expenses={expense.expenses} />
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
