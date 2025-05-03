import { DataTable } from "@/components/data-table";
import { TransactionAmount } from "@/components/transaction-amount";
import { createCategoryTheme } from "@/helpers/colors";
import type { ExpenseWithClientConvertedSchema } from "@/lib/schema";
import { datetime } from "@hoalu/common/datetime";
import { Badge } from "@hoalu/ui/badge";
import { createColumnHelper } from "@tanstack/react-table";

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
	}),
	columnHelper.accessor("wallet.name", {
		header: "Wallet",
		cell: (info) => info.getValue(),
	}),
];

export function RecentExpensesTable({ data }: { data: ExpenseWithClientConvertedSchema[] }) {
	return <DataTable data={data} columns={columns} enablePagination={false} />;
}
