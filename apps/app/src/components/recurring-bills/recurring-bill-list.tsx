import { unarchiveRecurringBillDialogAtom } from "#app/atoms/index.ts";
import { CurrencyValue } from "#app/components/currency-value.tsx";
import { useLayoutMode } from "#app/components/layouts/use-layout-mode.ts";
import {
	type SyncedRecurringBill,
	useSelectedRecurringBill,
} from "#app/components/recurring-bills/use-recurring-bills.ts";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { AVAILABLE_REPEAT_OPTIONS } from "#app/helpers/constants.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import {
	categoryCollectionFactory,
	recurringBillCollectionFactory,
	walletCollectionFactory,
} from "#app/lib/collections/index.ts";
import {
	ArchiveRestoreIcon,
	ChevronDownIcon,
	ChevronRightIcon,
	Trash2Icon,
} from "@hoalu/icons/lucide";
import { Badge } from "@hoalu/ui/badge";
import { Button } from "@hoalu/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hoalu/ui/empty";
import { cn } from "@hoalu/ui/utils";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useSetAtom } from "jotai";
import { memo, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

const MOBILE_NAV_HEIGHT = 80;

type BillItem = {
	type: "bill";
	bill: SyncedRecurringBill;
};

type GroupHeaderItem = {
	type: "group-header";
	repeat: string;
	label: string;
	bills: SyncedRecurringBill[];
};

type VirtualItem = BillItem | GroupHeaderItem;

const REPEAT_ORDER = ["daily", "weekly", "monthly", "yearly", "one-time"];

function useArchivedRecurringBills() {
	const workspace = useWorkspace();
	const collection = recurringBillCollectionFactory(workspace.slug);
	const walletCollection = walletCollectionFactory(workspace.slug);
	const categoryCollection = categoryCollectionFactory(workspace.slug);

	const { data } = useLiveQuery(
		(q) =>
			q
				.from({ bill: collection })
				.innerJoin({ wallet: walletCollection }, ({ bill, wallet }) =>
					eq(bill.wallet_id, wallet.id),
				)
				.leftJoin({ category: categoryCollection }, ({ bill, category }) =>
					eq(bill.category_id, category.id),
				)
				.orderBy(({ bill }) => bill.updated_at, "desc")
				.select(({ bill, wallet, category }) => ({
					...bill,
					wallet_name: wallet.name,
					category_name: category?.name ?? null,
					category_color: category?.color ?? null,
				})),
		[workspace.slug],
	);

	return useMemo(() => (data ?? []).filter((b) => !b.is_active), [data]);
}

function GroupHeader({ label, bills }: Omit<GroupHeaderItem, "type" | "repeat">) {
	const {
		metadata: { currency: workspaceCurrency },
	} = useWorkspace();

	const total = useMemo(() => {
		let sum = 0;
		for (const bill of bills) {
			if (bill.currency === workspaceCurrency) {
				sum += bill.amount;
			} else if (bill.convertedAmount > 0) {
				sum += bill.convertedAmount;
			}
		}
		return sum;
	}, [bills, workspaceCurrency]);

	return (
		<div
			data-slot="recurring-bill-group-title"
			className="border-muted bg-muted flex items-center py-2 pr-4 pl-3 text-xs"
		>
			<span className="font-medium">{label}</span>
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

interface RecurringBillRowProps {
	bill: SyncedRecurringBill;
	isSelected: boolean;
	onSelect: () => void;
}

function RecurringBillRow({ bill, isSelected, onSelect }: RecurringBillRowProps) {
	const {
		metadata: { currency: workspaceCurrency },
	} = useWorkspace();
	const isForeignCurrency = bill.currency !== workspaceCurrency;

	return (
		<button
			id={bill.id}
			type="button"
			onClick={onSelect}
			className={cn(
				"border-b-border/50 flex w-full items-center gap-0 overflow-hidden border-b py-2 pr-4 pl-3 text-left",
				"hover:bg-muted/50",
				"focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
				isSelected && "ring-ring ring-2 ring-inset",
			)}
		>
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<p className="truncate text-sm font-medium">{bill.title}</p>
				<div className="flex items-center gap-1.5">
					{bill.category_name && bill.category_color && (
						<Badge
							className={cn(
								"origin-left scale-90",
								createCategoryTheme(
									bill.category_color as Parameters<typeof createCategoryTheme>[0],
								),
							)}
						>
							{bill.category_name}
						</Badge>
					)}
				</div>
			</div>
			<div className="flex shrink-0 items-center gap-2 pr-1">
				<div className="flex flex-col items-end gap-0.5 leading-tight">
					<CurrencyValue
						value={isForeignCurrency ? bill.convertedAmount : bill.amount}
						currency={isForeignCurrency ? workspaceCurrency : bill.currency}
						prefix={isForeignCurrency ? "~" : undefined}
						className="text-[14px] font-semibold"
					/>
					{isForeignCurrency && (
						<CurrencyValue
							value={bill.amount}
							currency={bill.currency}
							prefix="original"
							className="text-muted-foreground/70 text-[10px]"
							as="p"
						/>
					)}
				</div>
			</div>
		</button>
	);
}

type ArchivedBill = ReturnType<typeof useArchivedRecurringBills>[number];

function ArchivedBillRow({ bill }: { bill: ArchivedBill }) {
	const setUnarchiveDialog = useSetAtom(unarchiveRecurringBillDialogAtom);
	const repeatLabel =
		AVAILABLE_REPEAT_OPTIONS.find((o) => o.value === bill.repeat)?.label ?? bill.repeat;

	return (
		<div className="border-b-border/50 flex w-full items-center gap-0 overflow-hidden border-b py-2 pr-2 pl-3">
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<p className="text-muted-foreground truncate text-sm font-medium line-through">
					{bill.title}
				</p>
				<div className="flex items-center gap-1.5">
					<p className="text-muted-foreground/60 text-xs">{repeatLabel}</p>
					{bill.category_name && bill.category_color && (
						<Badge
							className={cn(
								"origin-left scale-90 opacity-50",
								createCategoryTheme(
									bill.category_color as Parameters<typeof createCategoryTheme>[0],
								),
							)}
						>
							{bill.category_name}
						</Badge>
					)}
				</div>
			</div>
			<div className="flex gap-1">
				<Button
					size="icon"
					variant="ghost"
					aria-label={`Restore ${bill.title}`}
					onClick={() => setUnarchiveDialog({ state: true, data: { id: bill.id } })}
				>
					<Trash2Icon className="size-4" />
				</Button>
				<Button
					size="icon"
					variant="ghost"
					aria-label={`Restore ${bill.title}`}
					onClick={() => setUnarchiveDialog({ state: true, data: { id: bill.id } })}
				>
					<ArchiveRestoreIcon className="size-4" />
				</Button>
			</div>
		</div>
	);
}

function ArchivedSection() {
	const archivedBills = useArchivedRecurringBills();
	const [expanded, setExpanded] = useState(false);

	if (archivedBills.length === 0) {
		return null;
	}

	return (
		<div data-slot="archived-bills-section">
			<button
				type="button"
				onClick={() => setExpanded((v) => !v)}
				className="border-muted bg-muted/50 hover:bg-muted text-muted-foreground flex w-full items-center gap-1.5 py-2 pr-4 pl-3 text-xs transition-colors"
			>
				{expanded ? (
					<ChevronDownIcon className="size-4" />
				) : (
					<ChevronRightIcon className="size-4" />
				)}
				<span>Archived</span>
				<span className="bg-muted-foreground/20 ml-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium">
					{archivedBills.length}
				</span>
			</button>
			{expanded && archivedBills.map((bill) => <ArchivedBillRow key={bill.id} bill={bill} />)}
		</div>
	);
}

function EmptyState() {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>No recurring bills</EmptyTitle>
				<EmptyDescription>
					Set up your first recurring bill to track subscriptions and regular payments.
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}

interface RecurringBillListProps {
	bills: SyncedRecurringBill[];
}

function RecurringBillList({ bills }: RecurringBillListProps) {
	const { bill: selected, onSelectBill } = useSelectedRecurringBill();
	const { shouldUseMobileLayout } = useLayoutMode();
	const parentRef = useRef<HTMLDivElement>(null);

	// const {
	// 	metadata: { currency: workspaceCurrency },
	// } = useWorkspace();
	// const grandTotal = useMemo(() => {
	// 	let sum = 0;
	// 	for (const bill of bills) {
	// 		if (bill.currency === workspaceCurrency) {
	// 			sum += bill.amount;
	// 		} else if (bill.convertedAmount > 0) {
	// 			sum += bill.convertedAmount;
	// 		}
	// 	}
	// 	return sum;
	// }, [bills, workspaceCurrency]);

	const flatItems = useMemo<VirtualItem[]>(() => {
		const grouped = new Map<string, SyncedRecurringBill[]>();
		for (const bill of bills) {
			const key = bill.repeat;
			const existing = grouped.get(key);
			if (existing) {
				existing.push(bill);
			} else {
				grouped.set(key, [bill]);
			}
		}

		const sortedKeys = Array.from(grouped.keys()).sort((a, b) => {
			const ai = REPEAT_ORDER.indexOf(a);
			const bi = REPEAT_ORDER.indexOf(b);
			return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
		});

		const items: VirtualItem[] = [];
		for (const key of sortedKeys) {
			const groupBills = grouped.get(key)!;
			const label = AVAILABLE_REPEAT_OPTIONS.find((o) => o.value === key)?.label ?? key;
			items.push({ type: "group-header", repeat: key, label, bills: groupBills });
			for (const bill of groupBills) {
				items.push({ type: "bill", bill });
			}
		}
		return items;
	}, [bills]);

	const billsOnly = useMemo(
		() => flatItems.filter((i): i is BillItem => i.type === "bill").map((i) => i.bill),
		[flatItems],
	);

	const virtualizer = useVirtualizer({
		count: flatItems.length,
		overscan: 10,
		getScrollElement: () => parentRef.current,
		estimateSize: (index) => {
			const item = flatItems[index];
			return item?.type === "group-header" ? 32 : shouldUseMobileLayout ? 60 : 81;
		},
		paddingEnd: shouldUseMobileLayout ? MOBILE_NAV_HEIGHT : 0,
	});

	const scrollToBill = useEffectEvent((id: string) => {
		const index = flatItems.findIndex((i) => i.type === "bill" && i.bill.id === id);
		if (index >= 0) {
			virtualizer.scrollToIndex(index, { align: "auto" });
			requestAnimationFrame(() => {
				document.getElementById(id)?.focus();
			});
		}
	});

	const onSelectBillEvent = useEffectEvent((id: string | null) => {
		onSelectBill(id);
	});

	useHotkeys(
		"j",
		() => {
			if (!selected.id) return;
			const currentIndex = billsOnly.findIndex((b) => b.id === selected.id);
			const next = billsOnly[currentIndex + 1];
			if (!next) return;
			onSelectBillEvent(next.id);
			scrollToBill(next.id);
		},
		[selected.id, billsOnly],
	);

	useHotkeys(
		"k",
		() => {
			if (!selected.id) return;
			const currentIndex = billsOnly.findIndex((b) => b.id === selected.id);
			const prev = billsOnly[currentIndex - 1];
			if (!prev) return;
			onSelectBillEvent(prev.id);
			scrollToBill(prev.id);
		},
		[selected.id, billsOnly],
	);

	useHotkeys("esc", () => onSelectBillEvent(null), []);

	useEffect(() => {
		return () => {
			onSelectBillEvent(null);
		};
	}, []);

	if (bills.length === 0) {
		return (
			<div
				data-slot="recurring-bills-list-container"
				className={cn(
					"scrollbar-thin h-full w-full overflow-y-auto contain-strict",
					shouldUseMobileLayout ? "" : "rounded-tl-lg border-t border-l",
				)}
			>
				<EmptyState />
				<ArchivedSection />
			</div>
		);
	}

	const virtualExpenses = virtualizer.getVirtualItems();

	return (
		<div
			data-slot="recurring-bills-list-container"
			className={cn(
				"scrollbar-thin h-full w-full overflow-y-auto contain-strict",
				shouldUseMobileLayout ? "" : "rounded-tl-lg border-t border-l",
			)}
			ref={parentRef}
		>
			{/* <div className="border-muted bg-muted sticky top-0 z-10 flex items-center py-2 pr-4 pl-3 text-sm">
				<span>Total</span>
				<div className="ml-auto">
					<CurrencyValue
						value={grandTotal}
						currency={workspaceCurrency}
						className="text-destructive font-semibold"
					/>
				</div>
			</div> */}
			<div style={{ height: `${virtualizer.getTotalSize()}px` }} className="relative w-full">
				<div
					style={{
						transform: `translateY(${virtualExpenses[0]?.start ?? 0}px)`,
					}}
					className="absolute top-0 left-0 w-full"
				>
					{virtualExpenses.map((virtualRow) => {
						const item = flatItems[virtualRow.index];
						return (
							<div key={virtualRow.key} data-index={virtualRow.index}>
								{item.type === "group-header" ? (
									<GroupHeader label={item.label} bills={item.bills} />
								) : (
									<RecurringBillRow
										bill={item.bill}
										isSelected={selected.id === item.bill.id}
										onSelect={() =>
											onSelectBillEvent(selected.id === item.bill.id ? null : item.bill.id)
										}
									/>
								)}
							</div>
						);
					})}
					<ArchivedSection />
				</div>
			</div>
		</div>
	);
}

export default memo(RecurringBillList);
export { RecurringBillList };
