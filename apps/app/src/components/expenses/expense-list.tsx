import { CurrencyValue } from "#app/components/currency-value.tsx";
import ExpenseContent from "#app/components/expenses/expense-content.tsx";
import { type SyncedTransaction } from "#app/components/transactions/use-transactions.ts";
import { GroupedVirtualTable } from "#app/components/virtual-table/grouped-virtual-table.tsx";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { datetime } from "@hoalu/common/datetime";
import { Badge } from "@hoalu/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hoalu/ui/empty";
import { cn } from "@hoalu/ui/utils";
import { useNavigate, useParams } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";
import { memo, useCallback } from "react";

const GRID_TEMPLATE =
	"grid md:grid-cols-[var(--category-size)_1fr_var(--amount-size)_var(--amount-size)_var(--wallet-size)] grid-cols-[var(--category-size)_var(--title-size)_var(--amount-size)_var(--amount-size)_var(--wallet-size)]";

const columns: ColumnDef<SyncedTransaction>[] = [
	{ id: "category", header: "Category" },
	{ id: "title", header: "Title" },
	{
		id: "income-amount",
		header: "Income",
		meta: { headerClassName: "justify-end" },
	},
	{
		id: "expense-amount",
		header: "Expense",
		meta: { headerClassName: "justify-end" },
	},
	{ id: "wallet", header: "Wallet" },
];

function TransactionGroupHeader({
	groupKey,
	items,
}: {
	groupKey: string;
	items: SyncedTransaction[];
}) {
	const {
		metadata: { currency: workspaceCurrency },
	} = useWorkspace();

	let expenseTotal = 0;
	let incomeTotal = 0;
	for (const tx of items) {
		const v = tx.convertedAmount;
		if (typeof v === "number" && v >= 0) {
			if (tx.kind === "expense") expenseTotal += v;
			else incomeTotal += v;
		}
	}

	const isToday = datetime.format(new Date(), "yyyy-MM-dd") === groupKey;

	return (
		<div
			data-slot="transaction-group-header"
			className={cn("bg-muted flex w-full items-center border-b px-4 py-1 text-xs", GRID_TEMPLATE)}
		>
			<div className="flex items-center gap-2 font-mono font-medium">
				{datetime.format(new Date(groupKey), "E dd/MM/yyyy")}
				{isToday && <Badge className="ml-1">Today</Badge>}
			</div>
			<div />
			<div className="ml-auto flex items-center">
				{incomeTotal > 0 && (
					<CurrencyValue
						value={incomeTotal}
						currency={workspaceCurrency}
						prefix="+"
						className="text-success text-sm font-semibold"
					/>
				)}
			</div>
			<div className="ml-auto flex items-center">
				{expenseTotal > 0 && (
					<CurrencyValue
						value={expenseTotal}
						currency={workspaceCurrency}
						prefix="-"
						className="text-destructive text-sm font-semibold"
					/>
				)}
			</div>
		</div>
	);
}

const emptyState = (
	<Empty>
		<EmptyHeader>
			<EmptyTitle>No transactions</EmptyTitle>
			<EmptyDescription>Create your first expense or income to get started.</EmptyDescription>
		</EmptyHeader>
	</Empty>
);

function ExpenseList(props: { expenses: SyncedTransaction[] }) {
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const navigate = useNavigate();

	const handleSelect = useCallback(
		(id: string | null) => {
			if (!id) {
				navigate({ to: "/$slug/transactions", params: { slug } });
				return;
			}
			navigate({ to: "/$slug/transactions/$transactionId", params: { slug, transactionId: id } });
		},
		[navigate, slug],
	);

	const renderGroupHeader = useCallback(
		(groupKey: string, items: SyncedTransaction[]) => (
			<TransactionGroupHeader groupKey={groupKey} items={items} />
		),
		[],
	);

	const renderRow = useCallback(
		(item: SyncedTransaction, _isSelected: boolean) => <ExpenseContent {...item} />,
		[],
	);

	return (
		<GroupedVirtualTable<SyncedTransaction, string>
			items={props.expenses}
			getItemId={(tx) => tx.public_id}
			groupBy={(tx) => tx.date}
			groupOrder={(a, b) => b.localeCompare(a)}
			renderGroupHeader={renderGroupHeader}
			columns={columns}
			gridTemplate={GRID_TEMPLATE}
			renderRow={renderRow}
			estimateRowSize={45}
			onSelectItem={handleSelect}
			enableKeyboardNav={false}
			emptyState={emptyState}
		/>
	);
}

export default memo(ExpenseList);
