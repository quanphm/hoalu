import { createColumnHelper } from "@tanstack/react-table";

import { datetime } from "@hoalu/common/datetime";
import { Badge } from "@hoalu/ui/badge";
import { cn } from "@hoalu/ui/utils";
import { DataTable } from "@/components/data-table";
import { TransactionAmount } from "@/components/transaction-amount";
import { createCategoryTheme, createWalletTheme } from "@/helpers/colors";
import type { ExpenseWithClientConvertedSchema } from "@/lib/schema";

const columnHelper = createColumnHelper<ExpenseWithClientConvertedSchema>();

const columns = [
	columnHelper.accessor("date", {
		header: "Date",
		cell: (info) => {
			const value = info.getValue();
			return <p className="text-muted-foreground">{datetime.format(value, "d MMM yyyy")}</p>;
		},
		meta: {
			headerClassName:
				"w-(--header-date-size) min-w-(--header-date-size) max-w-(--header-date-size)",
			cellClassName: "w-(--col-date-size) min-w-(--col-date-size) max-w-(--col-date-size)",
		},
	}),
	columnHelper.accessor("title", {
		header: "Transaction",
		cell: (info) => info.getValue(),
	}),
	columnHelper.display({
		id: "amount",
		header: "Amount",
		cell: (info) => <TransactionAmount data={info.row.original} />,
		meta: {
			headerClassName:
				"w-(--header-expense-amount-size) min-w-(--header-expense-amount-size) max-w-(--header-expense-amount-size) text-right",
			cellClassName:
				"w-(--col-expense-amount-size) min-w-(--col-expense-amount-size) max-w-(--col-expense-amount-size) text-right tracking-tight",
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
];

export function RecentExpensesTable({ data }: { data: ExpenseWithClientConvertedSchema[] }) {
	return <DataTable data={data} columns={columns} enablePagination={false} />;
}
