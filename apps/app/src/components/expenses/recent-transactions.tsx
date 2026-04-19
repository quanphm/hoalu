import { CurrencyValue } from "#app/components/currency-value.tsx";
import { DataTable } from "#app/components/data-table/index.tsx";
import { type SyncedExpense, useLiveQueryExpenses } from "#app/components/expenses/use-expenses.ts";
import { type SyncedIncome, useLiveQueryIncomes } from "#app/components/incomes/use-incomes.ts";
import {
	Section,
	SectionContent,
	SectionHeader,
	SectionTitle,
	SectionAction,
} from "#app/components/layouts/section.tsx";
import { WalletBadge } from "#app/components/wallets/wallet-badge.tsx";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { datetime } from "@hoalu/common/datetime";
import { Badge } from "@hoalu/ui/badge";
import { Button } from "@hoalu/ui/button";
import { cn } from "@hoalu/ui/utils";
import { Link } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";

const RECENT_TRANSACTIONS_LIMIT = 10;

function formatDateLabel(dateStr: string): string {
	const date = new Date(`${dateStr.slice(0, 10)}T00:00:00`);
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	if (date.toDateString() === today.toDateString()) {
		return "Today";
	}
	if (date.toDateString() === yesterday.toDateString()) {
		return "Yesterday";
	}
	const sameYear = date.getFullYear() === today.getFullYear();
	return datetime.format(date, sameYear ? "MMM d" : "MMM d, yyyy");
}

// Unified transaction type
type Transaction = (SyncedExpense & { type: "expense" }) | (SyncedIncome & { type: "income" });

const columnHelper = createColumnHelper<Transaction>();

const columns = [
	columnHelper.accessor("date", {
		header: "Date",
		cell: (info) => {
			const date = info.getValue();
			return <span className="text-muted-foreground text-sm">{formatDateLabel(date)}</span>;
		},
		meta: {
			headerClassName:
				"w-(--date-size) min-w-(--date-size) max-w-(--date-size) text-left whitespace-nowrap",
			cellClassName:
				"w-(--date-size) min-w-(--date-size) max-w-(--date-size) text-left whitespace-nowrap",
		},
	}),
	columnHelper.display({
		id: "category",
		header: "Category",
		cell: (info) => {
			const transaction = info.row.original;
			if (!transaction.category?.name || !transaction.category?.color) {
				return <span className="text-muted-foreground text-sm">—</span>;
			}
			return (
				<div className="flex h-5 items-center gap-2">
					<Badge
						className={cn(
							createCategoryTheme(
								transaction.category.color as Parameters<typeof createCategoryTheme>[0],
							),
						)}
					>
						{transaction.category.name}
					</Badge>
				</div>
			);
		},
		meta: {
			headerClassName:
				"w-(--expense-category-size) min-w-(--expense-category-size) max-w-(--expense-category-size)",
			cellClassName:
				"w-(--expense-category-size) min-w-(--expense-category-size) max-w-(--expense-category-size)",
		},
	}),
	columnHelper.accessor("title", {
		header: "Title",
		cell: (info) => <span className="font-medium">{info.getValue()}</span>,
	}),
	columnHelper.display({
		id: "wallet",
		header: "Wallet",
		cell: (info) => {
			const transaction = info.row.original;
			if (!transaction.wallet?.name || !transaction.wallet?.type) {
				return <span className="text-muted-foreground text-sm">—</span>;
			}
			return (
				<div className="flex h-5 items-center">
					<WalletBadge name={transaction.wallet.name} type={transaction.wallet.type} />
				</div>
			);
		},
		meta: {
			headerClassName: "w-(--wallet-size) min-w-(--wallet-size) max-w-(--wallet-size)",
			cellClassName: "w-(--wallet-size) min-w-(--wallet-size) max-w-(--wallet-size)",
		},
	}),
	columnHelper.display({
		id: "amount",
		header: "Amount",
		cell: (info) => {
			const transaction = info.row.original;
			return (
				<CurrencyValue
					value={transaction.amount}
					currency={transaction.currency}
					prefix={transaction.type === "expense" ? "-" : "+"}
					style="currency"
					className={cn("text-sm font-semibold", transaction.type === "income" && "text-success")}
				/>
			);
		},
		meta: {
			headerClassName: "text-right",
			cellClassName: "text-right",
		},
	}),
];

export function RecentTransactions() {
	const workspace = useWorkspace();
	const expenses = useLiveQueryExpenses();
	const incomes = useLiveQueryIncomes();

	const transactions = useMemo<Transaction[]>(() => {
		const expenseTransactions: Transaction[] = expenses.map((e) => ({
			...e,
			type: "expense" as const,
		}));
		const incomeTransactions: Transaction[] = incomes.map((i) => ({
			...i,
			type: "income" as const,
		}));

		return [...expenseTransactions, ...incomeTransactions]
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
			.slice(0, RECENT_TRANSACTIONS_LIMIT);
	}, [expenses, incomes]);

	return (
		<Section className="gap-0 border-t md:gap-0">
			<SectionHeader className="px-4 py-3">
				<SectionTitle className="text-md">Recent Transactions</SectionTitle>
				<SectionAction>
					<Button
						variant="outline"
						size="xs"
						render={<Link to="/$slug/expenses" params={{ slug: workspace.slug }} />}
					>
						View all
					</Button>
				</SectionAction>
			</SectionHeader>
			<SectionContent columns={1}>
				<DataTable data={transactions} columns={columns} />
			</SectionContent>
		</Section>
	);
}
