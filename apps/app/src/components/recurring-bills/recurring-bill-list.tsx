import {
	archiveRecurringBillDialogAtom,
	deleteRecurringBillDialogAtom,
	unarchiveRecurringBillDialogAtom,
} from "#app/atoms/index.ts";
import { CurrencyValue } from "#app/components/currency-value.tsx";
import {
	REPEAT_ORDER,
	type SyncedAllRecurringBill,
	useAllRecurringBills,
} from "#app/components/recurring-bills/use-recurring-bills.ts";
import { TransactionAmount } from "#app/components/transaction-amount.tsx";
import { GroupedVirtualTable } from "#app/components/virtual-table/grouped-virtual-table.tsx";
import { WalletBadge } from "#app/components/wallets/wallet-badge.tsx";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { AVAILABLE_REPEAT_OPTIONS } from "#app/helpers/constants.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { MoreVerticalIcon } from "@hoalu/icons/lucide";
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
import { useSetAtom } from "jotai";
import { memo, useCallback, useMemo } from "react";

const GRID_TEMPLATE =
	"grid grid-cols-[var(--category-size)_1fr_var(--date-size)_var(--status-size)_var(--amount-size)_var(--wallet-size)_var(--action-size)]";

const columns: ColumnDef<SyncedAllRecurringBill>[] = [
	{ id: "category", header: "Category" },
	{ id: "name", header: "Name" },
	{ id: "repeat", header: "Repeat" },
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
			if (!bill.is_active) continue;
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

function RecurringBillContent(props: SyncedAllRecurringBill) {
	const setArchiveDialog = useSetAtom(archiveRecurringBillDialogAtom);
	const setUnarchiveDialog = useSetAtom(unarchiveRecurringBillDialogAtom);
	const setDeleteDialog = useSetAtom(deleteRecurringBillDialogAtom);

	const repeatLabel =
		AVAILABLE_REPEAT_OPTIONS.find((o) => o.value === props.repeat)?.label ?? props.repeat;

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
			<div className="flex items-center px-4 py-3">
				<span className="text-muted-foreground text-sm">{repeatLabel}</span>
			</div>
			<div className="flex items-center px-4 py-3">
				{props.is_active ? (
					<Badge variant="outline" className="text-success border-success/30 bg-success/10">
						Active
					</Badge>
				) : (
					<Badge variant="outline" className="text-muted-foreground">
						Archived
					</Badge>
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
						<MoreVerticalIcon className="size-4" />
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
				{/* {props.is_active ? (
					<Button
						size="icon-sm"
						variant="ghost"
						aria-label={`Archive ${props.title}`}
						onClick={(e) => {
							e.stopPropagation();
							setArchiveDialog({ state: true, data: { id: props.id } });
						}}
					>
						<ArchiveIcon />
					</Button>
				) : (
					<div className="flex items-center gap-0.5">
						<Button
							size="icon-sm"
							variant="ghost"
							aria-label={`Restore ${props.title}`}
							onClick={(e) => {
								e.stopPropagation();
								setUnarchiveDialog({ state: true, data: { id: props.id } });
							}}
						>
							<ArchiveRestoreIcon />
						</Button>
						<Button
							size="icon-sm"
							variant="destructive"
							aria-label={`Delete ${props.title}`}
							onClick={(e) => {
								e.stopPropagation();
								setDeleteDialog({ state: true, data: { id: props.id, title: props.title } });
							}}
						>
							<Trash2Icon />
						</Button>
					</div>
				)} */}
			</div>
		</>
	);
}

const emptyState = (
	<Empty>
		<EmptyHeader>
			<EmptyTitle>No recurring bills</EmptyTitle>
			<EmptyDescription>
				Set up your first recurring bill to track subscriptions and regular payments.
			</EmptyDescription>
		</EmptyHeader>
	</Empty>
);

function RecurringBillList() {
	const bills = useAllRecurringBills();
	const navigate = useNavigate();
	const { slug } = useParams({ from: "/_dashboard/$slug" });

	const handleSelect = useCallback(
		(id: string | null) => {
			if (!id) {
				navigate({ to: "/$slug/recurring-bills", params: { slug } });
				return;
			}
			navigate({ to: "/$slug/recurring-bills/$billId", params: { slug, billId: id } });
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
		(item: SyncedAllRecurringBill, _isSelected: boolean) => <RecurringBillContent {...item} />,
		[],
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
			emptyState={emptyState}
		/>
	);
}

export default memo(RecurringBillList);
