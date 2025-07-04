import { createColumnHelper } from "@tanstack/react-table";
import { useAtom } from "jotai";
import { Suspense } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { datetime } from "@hoalu/common/datetime";
import { XIcon } from "@hoalu/icons/lucide";
import { Badge } from "@hoalu/ui/badge";
import { Button } from "@hoalu/ui/button";
import { Card, CardAction, CardHeader, CardTitle } from "@hoalu/ui/card";
import { ScrollArea } from "@hoalu/ui/scroll-area";
import { cn } from "@hoalu/ui/utils";
import { selectedExpenseAtom } from "@/atoms";
import { DataTable } from "@/components/data-table";
import { TransactionAmount } from "@/components/transaction-amount";
import { createCategoryTheme, createWalletTheme } from "@/helpers/colors";
import { formatCurrency } from "@/helpers/currency";
import { useWorkspace } from "@/hooks/use-workspace";
import type { ExpenseWithClientConvertedSchema } from "@/lib/schema";
import { EditExpenseForm } from "./expense";

const columnHelper = createColumnHelper<ExpenseWithClientConvertedSchema>();

const columns = [
	columnHelper.accessor("date", {
		header: "Date",
		cell: ({ row }) => {
			const value = datetime.format(row.original.date, "dd/LL/yyyy");
			return value;
		},
		getGroupingValue: (row) => row.date,
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
		// @ts-expect-error
		aggregationFn: "expenseConvertedAmountSum",
		aggregatedCell: ({ getValue }) => {
			const value = getValue();
			const {
				metadata: { currency: workspaceCurrency },
			} = useWorkspace();
			return (
				<span className="font-semibold text-destructive tracking-tight">
					{formatCurrency(value as number, workspaceCurrency)}
				</span>
			);
		},
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

export function ExpensesTable({ data }: { data: ExpenseWithClientConvertedSchema[] }) {
	const [selected, setSelected] = useAtom(selectedExpenseAtom);

	function handleRowClick<T extends (typeof data)[number]>(rows: T[]) {
		const row = rows[0];
		setSelected({
			id: row ? row.id : null,
			data: row ? {} : null,
		});
	}

	function handleClose() {
		setSelected({ id: null, data: null });
	}

	useHotkeys("esc", handleClose, []);

	return (
		<>
			<DataTable
				data={data}
				columns={columns}
				enableGrouping
				onRowClick={handleRowClick}
				controlledState={{ grouping: ["date"] }}
				tableClassName="max-h-[calc(100vh-180px)] overflow-auto"
			/>

			<Suspense>
				{selected.id && (
					<Card className="fixed top-10 right-0 z-50 flex w-1/3 flex-col overflow-hidden shadow-xl">
						<CardHeader>
							<CardTitle>Expense details</CardTitle>
							<CardAction>
								<Button size="icon" variant="outline" onClick={() => handleClose()} autoFocus>
									<XIcon className="size-4" />
								</Button>
							</CardAction>
						</CardHeader>
						<ScrollArea className="h-[calc(100vh-(--spacing(4)*10))]">
							<EditExpenseForm id={selected.id} />
						</ScrollArea>
					</Card>
				)}
			</Suspense>
		</>
	);
}
