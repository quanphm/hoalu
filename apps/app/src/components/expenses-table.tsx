import { DataTable } from "@/components/data-table";
import { formatCurrency } from "@/helpers/currency";
import type { ExpenseSchema } from "@/lib/schema";
import { useDeleteExpense } from "@/services/mutations";
import { MoreHorizontalIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@hoalu/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@hoalu/ui/dropdown-menu";
import { type Row, createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { useState } from "react";

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
	columnHelper.accessor("category.name", {
		header: "Category",
		cell: (info) => info.getValue(),
		meta: {
			headerClassName:
				"w-(--header-category-size) min-w-(--header-category-size) max-w-(--header-category-size)",
			cellClassName:
				"w-(--col-category-size) min-w-(--col-category-size) max-w-(--col-category-size)",
		},
	}),
	columnHelper.accessor("amount", {
		header: "Amount",
		cell: (info) => {
			const value = formatCurrency(info.getValue(), info.row.original.currency);
			return <p>{value}</p>;
		},
		meta: {
			headerClassName:
				"w-(--header-amount-size) min-w-(--header-amount-size) max-w-(--header-amount-size) text-right",
			cellClassName:
				"w-(--col-amount-size) min-w-(--col-amount-size) max-w-(--col-amount-size) text-right",
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
	const [open, setOpen] = useState(false);
	const mutation = useDeleteExpense();

	const onDelete = async () => {
		await mutation.mutateAsync(row.original.id);
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontalIcon className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DialogTrigger asChild>
						<DropdownMenuItem>
							<span className="text-destructive">Delete</span>
						</DropdownMenuItem>
					</DialogTrigger>
				</DropdownMenuContent>
			</DropdownMenu>

			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle>Delete this expense?</DialogTitle>
					<DialogDescription>
						<span className="text-amber-600 text-sm">
							This action can't be undone. It will affect your spending history.
						</span>
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="secondary">
							No
						</Button>
					</DialogClose>
					<Button variant="destructive" onClick={() => onDelete()}>
						Yes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
