import { DataTable } from "@/components/data-table";
// import { ExpenseDropdownMenuWithModal } from "@/components/expense";
import { TransactionAmount } from "@/components/transaction-amount";
import { createCategoryTheme, createWalletTheme } from "@/helpers/colors";
import { formatCurrency } from "@/helpers/currency";
import { useWorkspace } from "@/hooks/use-workspace";
import type { ExpenseSchema } from "@/lib/schema";
import { Badge } from "@hoalu/ui/badge";
import { cn } from "@hoalu/ui/utils";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";

const columnHelper = createColumnHelper<ExpenseSchema>();

const columns = [
	columnHelper.accessor("date", {
		header: "Date",
		cell: (info) => {
			const value = info.getValue();
			return format(value, "d MMM yyyy");
		},
		getGroupingValue: (row) => format(row.date, "yyyy-MM-dd"),
		meta: {
			headerClassName:
				"w-(--header-date-size) min-w-(--header-date-size) max-w-(--header-date-size)",
			cellClassName: "w-(--col-date-size) min-w-(--col-date-size) max-w-(--col-date-size)",
		},
	}),
	columnHelper.accessor("title", {
		header: "Transaction",
		cell: (info) => info.getValue(),
		meta: {
			cellClassName: "font-semibold",
		},
	}),
	columnHelper.display({
		id: "amount",
		header: "Amount",
		cell: (info) => <TransactionAmount data={info.row.original} />,
		// @ts-expect-error
		aggregationFn: "expenseSum",
		aggregatedCell: ({ getValue }) => {
			const value = getValue();
			const {
				metadata: { currency: workspaceCurrency },
			} = useWorkspace();
			return formatCurrency(value as number, workspaceCurrency);
		},
		meta: {
			headerClassName:
				"w-(--header-expense-amount-size) min-w-(--header-expense-amount-size) max-w-(--header-expense-amount-size) text-right",
			cellClassName:
				"w-(--col-expense-amount-size) min-w-(--col-expense-amount-size) max-w-(--col-expense-amount-size) text-right",
		},
	}),
	columnHelper.display({
		id: "category",
		header: "Category",
		cell: ({ row }) => {
			const value = row.original.category;
			if (!value) {
				return null;
			}
			const className = createCategoryTheme(value.color);
			return <Badge className={className}>{value.name}</Badge>;
		},
		meta: {
			headerClassName:
				"w-(--header-expense-category-size) min-w-(--header-expense-category-size) max-w-(--header-expense-category-size)",
			cellClassName:
				"w-(--col-expense-category-size) min-w-(--col-expense-category-size) max-w-(--col-expense-category-size)",
		},
	}),
	columnHelper.accessor("wallet.name", {
		header: "Wallet",
		cell: ({ getValue, row }) => {
			const value = getValue();
			const theme = createWalletTheme(row.original.wallet.type);
			return (
				<Badge variant="outline" className="gap-1.5">
					<span className={cn("size-2 rounded-full bg-emerald-500", theme)} aria-hidden="true" />
					{value}
				</Badge>
			);
		},
		meta: {
			headerClassName:
				"w-(--header-expense-wallet-size) min-w-(--header-expense-wallet-size) max-w-(--header-expense-wallet-size)",
			cellClassName:
				"w-(--col-expense-wallet-size) min-w-(--col-expense-wallet-size) max-w-(--col-expense-wallet-size)",
		},
	}),
	// columnHelper.display({
	// 	id: "actions",
	// 	header: () => <span className="sr-only">Actions</span>,
	// 	cell: (info) => <ExpenseDropdownMenuWithModal id={info.row.original.id} />,
	// 	meta: {
	// 		headerClassName:
	// 			"w-(--header-action-size) min-w-(--header-action-size) max-w-(--header-action-size)",
	// 		cellClassName: "w-(--col-action-size) min-w-(--col-action-size) max-w-(--col-action-size)",
	// 	},
	// }),
];

export function ExpensesTable({ data }: { data: ExpenseSchema[] }) {
	return (
		<DataTable
			data={data}
			columns={columns}
			enableGrouping={true}
			initialState={{
				grouping: ["date"],
				expanded: true,
			}}
		/>
	);
}
