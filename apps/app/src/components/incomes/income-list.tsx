import IncomeContent from "#app/components/incomes/income-content.tsx";
import { type SyncedIncome, useSelectedIncome } from "#app/components/incomes/use-incomes.ts";
import { useLayoutMode } from "#app/components/layouts/use-layout-mode.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { datetime } from "@hoalu/common/datetime";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hoalu/ui/empty";
import { cn } from "@hoalu/ui/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { memo, useEffect, useEffectEvent, useMemo, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { CurrencyValue } from "../currency-value";

const MOBILE_NAV_HEIGHT = 80;

type IncomeItem = {
	type: "income";
	income: SyncedIncome;
	date: string;
};

type GroupHeaderItem = {
	type: "group-header";
	date: string;
	incomes: SyncedIncome[];
};

type VirtualItem = IncomeItem | GroupHeaderItem;

function GroupHeader({ date, incomes }: Omit<GroupHeaderItem, "type">) {
	// const isToday = datetime.format(new Date(), "yyyy-MM-dd") === date;
	return (
		<div
			data-slot="income-group-title"
			className="border-muted bg-muted flex items-center py-2 pr-4 pl-3 text-xs"
		>
			<div className="flex items-center gap-2">
				{datetime.format(date, "MMM yyyy")}
				{/* {isToday && <Badge className="ml-1">Today</Badge>} */}
			</div>
			<div className="ml-auto">
				<TotalIncomeByDate data={incomes} />
			</div>
		</div>
	);
}

function TotalIncomeByDate(props: { data: SyncedIncome[] }) {
	const {
		metadata: { currency: workspaceCurrency },
	} = useWorkspace();
	const total = props.data.reduce((sum, current) => {
		const value = current.convertedAmount;
		// convertedAmount can be -1 when conversion fails
		// Exclude negatives from the total
		return sum + (typeof value === "number" && value >= 0 ? value : 0);
	}, 0);

	return (
		<CurrencyValue
			value={total}
			currency={workspaceCurrency}
			className="font-semibold text-green-600"
		/>
	);
}

function EmptyState() {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>No income</EmptyTitle>
				<EmptyDescription>Create your first income to track your earnings.</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}

function IncomeList(props: { incomes: SyncedIncome[] }) {
	const { income: selectedIncome, onSelectIncome } = useSelectedIncome();
	const { shouldUseMobileLayout } = useLayoutMode();
	const parentRef = useRef<HTMLDivElement>(null);

	const flattenIncomes = useMemo(() => {
		const grouped = new Map<string, SyncedIncome[]>();
		props.incomes.forEach((income) => {
			const dateKey = `${new Date(income.date).getMonth() + 1}/1/${new Date(income.date).getFullYear()}`;
			const existing = grouped.get(`${dateKey}`);
			if (existing) {
				existing.push(income);
			} else {
				grouped.set(`${dateKey}`, [income]);
			}
		});

		const items: VirtualItem[] = [];
		Array.from(grouped.entries()).forEach(([date, groupIncomes]) => {
			items.push({
				type: "group-header",
				date,
				incomes: groupIncomes,
			});
			groupIncomes.forEach((income) => {
				items.push({
					type: "income",
					date,
					income,
				});
			});
		});

		return items;
	}, [props.incomes]);

	const virtualizer = useVirtualizer({
		count: flattenIncomes.length,
		overscan: 10,
		getScrollElement: () => parentRef.current,
		estimateSize: (index) => {
			const item = flattenIncomes[index];
			if (shouldUseMobileLayout) {
				return item.type === "group-header" ? 40 : 60;
			}
			return item.type === "group-header" ? 40 : 81;
		},
		// Add padding at the bottom for mobile nav bar
		paddingEnd: shouldUseMobileLayout ? MOBILE_NAV_HEIGHT : 0,
	});

	const scrollToIncome = useEffectEvent((id: string) => {
		// Find the index in the flattened list (which includes group headers)
		const index = flattenIncomes.findIndex(
			(item) => item.type === "income" && item.income.id === id,
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

	const onSelectIncomeEvent = useEffectEvent((id: string | null) => {
		onSelectIncome(id);
	});

	useHotkeys(
		"j",
		() => {
			if (!selectedIncome.id) return;

			const currentIndex = props.incomes.findIndex((item) => item.id === selectedIncome.id);
			const nextIndex = currentIndex + 1;
			const nextRowData = props.incomes[nextIndex];

			if (!nextRowData) return;

			onSelectIncomeEvent(nextRowData.id);
			scrollToIncome(nextRowData.id);
		},
		[selectedIncome.id, props.incomes],
	);

	useHotkeys(
		"k",
		() => {
			if (!selectedIncome.id) return;

			const currentIndex = props.incomes.findIndex((item) => item.id === selectedIncome.id);
			const prevIndex = currentIndex - 1;
			const prevRowData = props.incomes[prevIndex];

			if (!prevRowData) return;

			onSelectIncomeEvent(prevRowData.id);
			scrollToIncome(prevRowData.id);
		},
		[selectedIncome.id, props.incomes],
	);

	// Clear selection on unmount
	useEffect(() => {
		return () => {
			onSelectIncomeEvent(null);
		};
	}, []);

	useHotkeys("esc", () => onSelectIncomeEvent(null), []);

	if (props.incomes.length === 0) {
		return <EmptyState />;
	}

	const virtualIncomes = virtualizer.getVirtualItems();

	return (
		<div
			ref={parentRef}
			data-slot="income-list-container"
			className={cn(
				"scrollbar-thin h-full w-full overflow-y-auto contain-strict",
				shouldUseMobileLayout ? "" : "rounded-tl-lg border-t border-l",
			)}
		>
			<div style={{ height: `${virtualizer.getTotalSize()}px` }} className="relative w-full">
				<div
					style={{
						transform: `translateY(${virtualIncomes[0]?.start ?? 0}px)`,
					}}
					className="absolute top-0 left-0 w-full"
				>
					{virtualIncomes.map((virtualRow) => {
						const income = flattenIncomes[virtualRow.index];
						return (
							<div key={virtualRow.key} data-index={virtualRow.index}>
								{income.type === "group-header" ? (
									<GroupHeader date={income.date} incomes={income.incomes} />
								) : (
									<IncomeContent {...income.income} onClick={onSelectIncome} />
								)}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

export default memo(IncomeList);
