import { DotsThreeVerticalIcon } from "@hoalu/icons/phosphor";
import { Badge } from "@hoalu/ui/badge";
import { Button } from "@hoalu/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@hoalu/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hoalu/ui/empty";
import { cn } from "@hoalu/ui/utils";
import { useNavigate, useParams } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, useMemo, type MutableRefObject, type ReactNode } from "react";

import {
	archiveRecurringBillDialog,
	deleteRecurringBillDialog,
	unarchiveRecurringBillDialog,
} from "#app/atoms/index.ts";
import { CurrencyValue } from "#app/components/currency-value.tsx";
import {
	REPEAT_ORDER,
	type SyncedAllRecurringBill,
	useAllRecurringBills,
} from "#app/components/recurring-bills/use-recurring-bills.ts";
import { TransactionAmount } from "#app/components/transaction-amount.tsx";
import { useBillingProjection } from "#app/components/upcoming-bills/use-billing-projection.ts";
import { GroupedVirtualTable } from "#app/components/virtual-table/grouped-virtual-table.tsx";
import { WalletBadge } from "#app/components/wallets/wallet-badge.tsx";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { AVAILABLE_REPEAT_OPTIONS } from "#app/helpers/constants.ts";
import { formatDueDate, formatDueIn } from "#app/helpers/due-date.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";

import type { ProjectedBill } from "#app/components/upcoming-bills/use-billing-projection.ts";
import type { HeaderOnlyTableFeatures } from "#app/lib/table-features.ts";

const GRID_TEMPLATE =
	"grid grid-cols-[var(--category-size)_1fr_var(--date-size)_var(--status-size)_var(--amount-size)_var(--wallet-size)_var(--action-size)]";

const columns: ColumnDef<HeaderOnlyTableFeatures, SyncedAllRecurringBill>[] = [
	{ id: "category", header: "Category" },
	{ id: "name", header: "Name" },
	// The rows are grouped by repeat, so the group header already states the cadence.
	{ id: "due", header: "Next due" },
	{ id: "status", header: "Status" },
	{ id: "amount", header: "Amount", meta: { headerClassName: "justify-end" } },
	{ id: "wallet", header: "Wallet" },
	{ id: "actions", header: "", meta: { headerClassName: "justify-end" } },
];

function BillGroupHeader({
	groupKey,
	items,
}: {
	groupKey: string;
	items: SyncedAllRecurringBill[];
}) {
	const {
		metadata: { currency: workspaceCurrency },
	} = useWorkspace();

	const label = AVAILABLE_REPEAT_OPTIONS.find((o) => o.value === groupKey)?.label ?? groupKey;

	const total = useMemo(() => {
		let sum = 0;
		for (const bill of items) {
			if (bill.currency === workspaceCurrency) {
				sum += bill.amount;
			} else if (bill.convertedAmount > 0) {
				sum += bill.convertedAmount;
			}
		}
		return sum;
	}, [items, workspaceCurrency]);

	return (
		<div
			data-slot="recurring-bill-group-header"
			className={cn(
				"bg-muted flex w-full items-center border-b px-4 py-1 font-mono text-xs",
				GRID_TEMPLATE,
			)}
		>
			{/* Spans every track up to Status, so the group total stays aligned with the Amount column. */}
			<div className="col-span-4 font-medium">{label}</div>
			<div className="ml-auto flex items-center">
				{total > 0 && (
					<CurrencyValue
						value={total}
						currency={workspaceCurrency}
						className="text-destructive text-sm font-semibold"
					/>
				)}
			</div>
		</div>
	);
}

function RecurringBillContent(props: SyncedAllRecurringBill & { nextDue?: ProjectedBill }) {
	const setArchiveDialog = archiveRecurringBillDialog.set;
	const setUnarchiveDialog = unarchiveRecurringBillDialog.set;
	const setDeleteDialog = deleteRecurringBillDialog.set;

	const nextDue = props.nextDue;
	const isOverdue = nextDue !== undefined && nextDue.daysUntil < 0;

	return (
		<>
			<div className="flex items-center px-4 py-3">
				{props.category_name && props.category_color ? (
					<Badge
						className={cn(
							props.is_active ? "" : "opacity-50",
							createCategoryTheme(
								props.category_color as Parameters<typeof createCategoryTheme>[0],
							),
						)}
					>
						{props.category_name}
					</Badge>
				) : (
					<span className="text-muted-foreground text-sm">—</span>
				)}
			</div>
			<div className="flex items-center truncate px-4 py-3">
				<p
					className={cn(
						"truncate text-sm font-medium",
						!props.is_active && "text-muted-foreground",
					)}
					title={props.title}
				>
					{props.title}
				</p>
			</div>
			<div className="flex items-center truncate px-4 py-3">
				{nextDue ? (
					<span
						className={cn(
							"truncate text-xs",
							isOverdue ? "text-destructive font-medium" : "text-muted-foreground",
						)}
						title={`${formatDueDate(nextDue.date)} · ${formatDueIn(nextDue.daysUntil)}`}
					>
						{formatDueDate(nextDue.date)} · {formatDueIn(nextDue.daysUntil)}
					</span>
				) : (
					<span className="text-muted-foreground text-sm">—</span>
				)}
			</div>
			<div className="flex items-center px-4 py-3">
				{props.is_active ? (
					<Badge variant="success">Active</Badge>
				) : (
					<Badge variant="muted">Archived</Badge>
				)}
			</div>
			<div className="flex flex-col items-end justify-center px-4 py-3">
				<TransactionAmount
					data={{
						amount: props.amount,
						convertedAmount: props.convertedAmount,
						currency: props.currency,
					}}
					className={cn("text-sm font-medium", !props.is_active && "text-muted-foreground")}
				/>
			</div>
			<div className="flex items-center px-4 py-3">
				<WalletBadge name={props.wallet_name} type={props.wallet_type} />
			</div>
			<div className="flex items-center justify-end px-4">
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button
								variant="ghost"
								size="icon"
								onClick={(e) => {
									e.stopPropagation();
								}}
							/>
						}
					>
						<span className="sr-only">Open menu</span>
						<DotsThreeVerticalIcon className="size-4" />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{props.is_active && (
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									setArchiveDialog({ state: true, data: { id: props.id } });
								}}
							>
								Archive
							</DropdownMenuItem>
						)}
						{!props.is_active && (
							<>
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										setUnarchiveDialog({ state: true, data: { id: props.id } });
									}}
								>
									Restore
								</DropdownMenuItem>
								<DropdownMenuItem
									variant="destructive"
									onClick={(e) => {
										e.stopPropagation();
										setDeleteDialog({ state: true, data: { id: props.id, title: props.title } });
									}}
								>
									Delete
								</DropdownMenuItem>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</>
	);
}

export type RecurringBillStatusFilter = "all" | "active" | "archived";

const emptyStates: Record<RecurringBillStatusFilter, ReactNode> = {
	all: (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>No recurring bills</EmptyTitle>
				<EmptyDescription>
					Set up your first recurring bill to track subscriptions and regular payments.
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	),
	active: (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>No active recurring bills</EmptyTitle>
				<EmptyDescription>
					Set up your first recurring bill to track subscriptions and regular payments.
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	),
	archived: (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>No archived recurring bills</EmptyTitle>
				<EmptyDescription>Archived bills will appear here.</EmptyDescription>
			</EmptyHeader>
		</Empty>
	),
};

function RecurringBillList({
	statusFilter,
	scrollRef,
}: {
	statusFilter: RecurringBillStatusFilter;
	scrollRef?: MutableRefObject<number>;
}) {
	const allBills = useAllRecurringBills();
	const { nextDueByBill } = useBillingProjection();
	const bills = useMemo(() => {
		if (statusFilter === "all") return allBills;
		return allBills.filter((b) => (statusFilter === "active" ? b.is_active : !b.is_active));
	}, [allBills, statusFilter]);
	const navigate = useNavigate();
	const { slug } = useParams({ from: "/_dashboard/$slug" });

	const handleSelect = useCallback(
		(id: string | null) => {
			if (!id) {
				navigate({ to: "/$slug/recurring-bills", params: { slug } });
				return;
			}
			navigate({
				to: "/$slug/recurring-bills/$billId",
				params: { slug, billId: id },
				resetScroll: false,
			});
		},
		[navigate, slug],
	);

	const renderGroupHeader = useCallback(
		(groupKey: string, items: SyncedAllRecurringBill[]) => (
			<BillGroupHeader groupKey={groupKey} items={items} />
		),
		[],
	);

	const renderRow = useCallback(
		(item: SyncedAllRecurringBill, _isSelected: boolean) => (
			<RecurringBillContent {...item} nextDue={nextDueByBill[item.id]} />
		),
		[nextDueByBill],
	);

	const groupOrder = useCallback((a: string, b: string) => {
		const ai = REPEAT_ORDER.indexOf(a);
		const bi = REPEAT_ORDER.indexOf(b);
		return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
	}, []);

	return (
		<GroupedVirtualTable<SyncedAllRecurringBill, string>
			items={bills}
			getItemId={(b) => b.public_id}
			groupBy={(b) => b.repeat}
			groupOrder={groupOrder}
			renderGroupHeader={renderGroupHeader}
			columns={columns}
			gridTemplate={GRID_TEMPLATE}
			renderRow={renderRow}
			estimateRowSize={45}
			onSelectItem={handleSelect}
			enableKeyboardNav={true}
			scrollPositionRef={scrollRef}
			emptyState={emptyStates[statusFilter]}
		/>
	);
}

export default memo(RecurringBillList);
