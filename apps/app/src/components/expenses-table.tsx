import { DataTable } from "@/components/data-table";
import { ExpenseDropdownMenuWithModal } from "@/components/expense";
import { TransactionAmount } from "@/components/transaction-amount";
import { createCategoryTheme } from "@/helpers/colors";
import type { ExpenseSchema } from "@/lib/schema";
import { Badge } from "@hoalu/ui/badge";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";

const columnHelper = createColumnHelper<ExpenseSchema>();

const columns = [
	columnHelper.accessor("date", {
		header: "Date",
		cell: (info) => {
			const value = info.getValue();
			return <p className="text-muted-foreground">{format(value, "d MMM yyyy")}</p>;
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
		meta: {
			headerClassName:
				"w-(--header-title-size) min-w-(--header-title-size) max-w-(--header-title-size)",
			cellClassName: "w-(--col-title-size) min-w-(--col-title-size) max-w-(--col-title-size)",
		},
	}),
	columnHelper.display({
		id: "amount",
		header: "Amount",
		cell: (info) => <TransactionAmount data={info.row.original} />,
		meta: {
			headerClassName:
				"w-(--header-amount-size) min-w-(--header-amount-size) max-w-(--header-amount-size) text-right",
			cellClassName:
				"w-(--col-amount-size) min-w-(--col-amount-size) max-w-(--col-amount-size) text-right",
		},
	}),
	columnHelper.display({
		id: "category",
		header: "Category",
		cell: (info) => {
			const value = info.row.original.category;
			if (!value) {
				return null;
			}
			const className = createCategoryTheme(value.color);
			return <Badge className={className}>{value.name}</Badge>;
		},
		meta: {
			headerClassName:
				"w-(--header-category-size) min-w-(--header-category-size) max-w-(--header-category-size)",
			cellClassName:
				"w-(--col-category-size) min-w-(--col-category-size) max-w-(--col-category-size)",
		},
	}),
	columnHelper.accessor("wallet.name", {
		header: "Wallet",
		cell: (info) => info.getValue(),
		// meta: {
		// 	headerClassName:
		// 		"w-(--header-wallet-size) min-w-(--header-wallet-size) max-w-(--header-wallet-size)",
		// 	cellClassName: "w-(--col-wallet-size) min-w-(--col-wallet-size) max-w-(--col-wallet-size)",
		// },
	}),
	columnHelper.display({
		id: "actions",
		header: () => <span className="sr-only">Actions</span>,
		cell: (info) => <ExpenseDropdownMenuWithModal id={info.row.original.id} />,
		meta: {
			headerClassName:
				"w-(--header-action-size) min-w-(--header-action-size) max-w-(--header-action-size)",
			cellClassName: "w-(--col-action-size) min-w-(--col-action-size) max-w-(--col-action-size)",
		},
	}),
];

export function ExpensesTable({ data }: { data: ExpenseSchema[] }) {
	return <DataTable data={data} columns={columns} enableMultiRowSelection={false} />;
}
