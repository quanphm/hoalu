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
import { Separator } from "@hoalu/ui/separator";
import { Tabs, TabsList, TabsTab } from "@hoalu/ui/tabs";
import { cn } from "@hoalu/ui/utils";
import { Link } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo, useState } from "react";

const RECENT_TRANSACTIONS_LIMIT = 20;

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
			headerClassName: "w-(--category-size) min-w-(--category-size) max-w-(--category-size)",
			cellClassName: "w-(--category-size) min-w-(--category-size) max-w-(--category-size)",
		},
	}),
	columnHelper.accessor("title", {
		header: "Title",
		cell: (info) => (
			<span className="font-medium" title={info.getValue()}>
				{info.getValue()}
			</span>
		),
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
					className={cn("text-sm font-medium", transaction.type === "income" && "text-success")}
				/>
			);
		},
		meta: {
			headerClassName: "text-right w-(--amount-size) min-w-(--amount-size) max-w-(--amount-size)",
			cellClassName: "text-right w-(--amount-size) min-w-(--amount-size) max-w-(--amount-size)",
		},
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
			cellClassName: "w-(--wallet-size) min-w-(--wallet-size) max-w-(--wallet-size) ",
		},
	}),
];

type TransactionTab = "all" | "expense" | "income";

export function RecentTransactions() {
	const workspace = useWorkspace();
	const expenses = useLiveQueryExpenses();
	const incomes = useLiveQueryIncomes();
	const [activeTab, setActiveTab] = useState<TransactionTab>("all");

	const transactions = useMemo<Transaction[]>(() => {
		const expenseTransactions: Transaction[] = expenses.map((e) => ({
			...e,
			type: "expense" as const,
		}));
		const incomeTransactions: Transaction[] = incomes.map((i) => ({
			...i,
			type: "income" as const,
		}));

		const allTransactions = [...expenseTransactions, ...incomeTransactions]
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
			.slice(0, RECENT_TRANSACTIONS_LIMIT);

		if (activeTab === "expense") {
			return allTransactions.filter((t) => t.type === "expense");
		}
		if (activeTab === "income") {
			return allTransactions.filter((t) => t.type === "income");
		}
		return allTransactions;
	}, [expenses, incomes, activeTab]);

	return (
		<Section className="gap-0 border-t md:gap-0">
			<SectionHeader className="p-4">
				<SectionTitle className="text-md">Recent Transactions</SectionTitle>
				<SectionAction className="flex h-auto items-center gap-2">
					<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TransactionTab)}>
						<TabsList>
							<TabsTab value="all" className="sm:h-6">
								All
							</TabsTab>
							<TabsTab value="income" className="sm:h-6">
								Incomes
							</TabsTab>
							<TabsTab value="expense" className="sm:h-6">
								Expenses
							</TabsTab>
						</TabsList>
					</Tabs>
					<Separator orientation="vertical" className="data-[orientation=vertical]:h-6" />
					<Button
						variant="outline"
						size="sm"
						render={<Link to="/$slug/transactions" params={{ slug: workspace.slug }} />}
					>
						View all
					</Button>
				</SectionAction>
			</SectionHeader>
			<SectionContent columns={1}>
				<DataTable
					data={transactions}
					columns={columns}
					paginationConfig={{
						enabled: true,
						showPerPage: false,
						showPageNumberInfo: false,
						showNavigationButtons: true,
					}}
				/>
			</SectionContent>
		</Section>
	);
}
