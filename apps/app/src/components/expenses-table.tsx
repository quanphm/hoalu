import { DataTable } from "@/components/data-table";
import { DeleteExpenseDialog, DeleteExpenseTrigger } from "@/components/expense";
import { createCategoryTheme } from "@/helpers/colors";
import { formatCurrency } from "@/helpers/currency";
import { useWorkspace } from "@/hooks/use-workspace";
import type { ExpenseSchema } from "@/lib/schema";
import { useDeleteExpense } from "@/services/mutations";
import { exchangeRatesQueryOptions } from "@/services/query-options";
import { zeroDecimalCurrencies } from "@hoalu/countries";
import { MoreHorizontalIcon } from "@hoalu/icons/lucide";
import { Badge } from "@hoalu/ui/badge";
import { Button } from "@hoalu/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@hoalu/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { type Row, createColumnHelper } from "@tanstack/react-table";
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
	}),
	columnHelper.display({
		id: "amount",
		header: "Amount",
		cell: (info) => <RowAmount row={info.row} />,
		meta: {
			headerClassName:
				"w-(--header-amount-size) min-w-(--header-amount-size) max-w-(--header-amount-size) text-right",
			cellClassName:
				"w-(--col-amount-size) min-w-(--col-amount-size) max-w-(--col-amount-size) text-right",
		},
	}),
	columnHelper.accessor("category.name", {
		header: "Category",
		cell: (info) => {
			const value = info.getValue();
			const className = createCategoryTheme(info.row.original.category.color);
			return <Badge className={className}>{value}</Badge>;
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
		meta: {
			headerClassName:
				"w-(--header-wallet-size) min-w-(--header-wallet-size) max-w-(--header-wallet-size)",
			cellClassName: "w-(--col-wallet-size) min-w-(--col-wallet-size) max-w-(--col-wallet-size)",
		},
	}),
	columnHelper.display({
		id: "actions",
		header: () => <span className="sr-only">Actions</span>,
		cell: (info) => <RowActions row={info.row} />,
		meta: {
			headerClassName:
				"w-(--header-action-size) min-w-(--header-action-size) max-w-(--header-action-size)",
			cellClassName: "w-(--col-action-size) min-w-(--col-action-size) max-w-(--col-action-size)",
		},
	}),
];

export function ExpensesTable({
	data,
	actionable = true,
}: { data: ExpenseSchema[]; actionable?: boolean }) {
	const tableColumns = actionable ? columns : columns.filter((c) => c.id !== "actions");
	return <DataTable data={data} columns={tableColumns} />;
}

function RowActions({ row }: { row: Row<ExpenseSchema> }) {
	const mutation = useDeleteExpense();
	const onDelete = async () => {
		await mutation.mutateAsync({ id: row.original.id });
	};

	return (
		<DeleteExpenseDialog onDelete={onDelete}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontalIcon className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DeleteExpenseTrigger>
						<DropdownMenuItem>
							<span className="text-destructive">Delete</span>
						</DropdownMenuItem>
					</DeleteExpenseTrigger>
				</DropdownMenuContent>
			</DropdownMenu>
		</DeleteExpenseDialog>
	);
}

function RowAmount({ row }: { row: Row<ExpenseSchema> }) {
	const {
		metadata: { currency: targetCurr },
	} = useWorkspace();
	const { amount, realAmount, currency: sourceCurr } = row.original;
	const { data: rate, status } = useQuery(
		exchangeRatesQueryOptions({ from: sourceCurr, to: targetCurr }),
	);

	if (targetCurr === sourceCurr) {
		return <p className="font-medium">{formatCurrency(amount, targetCurr)}</p>;
	}

	if (status === "error") {
		return <p className="text-destructive">Error</p>;
	}

	if (!rate) {
		return <p className="text-muted-foreground">Converting...</p>;
	}

	const isNoCent = zeroDecimalCurrencies.find((c) => c === sourceCurr);
	const factor = isNoCent ? 1 : 100;
	const convertedValue = realAmount * (rate / factor);

	return (
		<div className="leading-relaxed">
			<p className="font-medium">{formatCurrency(convertedValue, targetCurr)}</p>
			{targetCurr !== sourceCurr && (
				<p className="text-muted-foreground text-xs tracking-tight">
					Original {formatCurrency(amount, sourceCurr)}
				</p>
			)}
		</div>
	);
}
