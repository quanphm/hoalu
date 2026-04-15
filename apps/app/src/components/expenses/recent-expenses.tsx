import { CurrencyValue } from "#app/components/currency-value.tsx";
import { DataTable } from "#app/components/data-table/index.tsx";
import { type SyncedExpense, useLiveQueryExpenses } from "#app/components/expenses/use-expenses.ts";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { datetime } from "@hoalu/common/datetime";
import { Badge } from "@hoalu/ui/badge";
import { Button } from "@hoalu/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hoalu/ui/empty";
import { Frame, FrameHeader, FrameTitle } from "@hoalu/ui/frame";
import { cn } from "@hoalu/ui/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";

const RECENT_EXPENSES_LIMIT = 8;

const colorMap: Record<string, string> = {
	red: "bg-red-400",
	green: "bg-emerald-400",
	teal: "bg-teal-400",
	blue: "bg-blue-400",
	yellow: "bg-amber-300",
	orange: "bg-orange-400",
	purple: "bg-violet-400",
	pink: "bg-pink-400",
	gray: "bg-slate-300",
	indigo: "bg-indigo-400",
	stone: "bg-stone-300",
};

function getCategoryStripeColor(color: string): string {
	return colorMap[color] ?? "bg-muted-foreground/30";
}

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

const columnHelper = createColumnHelper<SyncedExpense>();

const columns = [
	columnHelper.accessor("date", {
		header: "Date",
		cell: (info) => {
			const date = info.getValue();
			return <span className="text-muted-foreground text-sm">{formatDateLabel(date)}</span>;
		},
	}),
	columnHelper.display({
		id: "category",
		header: "Category",
		cell: (info) => {
			const expense = info.row.original;
			if (!expense.category?.name || !expense.category?.color) {
				return <span className="text-muted-foreground text-sm">—</span>;
			}
			return (
				<div className="flex h-5 items-center gap-2">
					<Badge
						className={cn(
							createCategoryTheme(
								expense.category.color as Parameters<typeof createCategoryTheme>[0],
							),
						)}
					>
						{expense.category.name}
					</Badge>
				</div>
			);
		},
	}),
	columnHelper.accessor("title", {
		header: "Title",
		cell: (info) => <span className="font-medium">{info.getValue()}</span>,
	}),
	columnHelper.display({
		id: "amount",
		header: "Amount",
		cell: (info) => {
			const expense = info.row.original;
			return (
				<CurrencyValue
					value={expense.amount}
					currency={expense.currency}
					style="currency"
					className="text-sm font-semibold"
				/>
			);
		},
	}),
];

export function RecentExpenses() {
	const workspace = useWorkspace();
	const navigate = useNavigate();
	const expenses = useLiveQueryExpenses();
	const recentExpenses = expenses.slice(0, RECENT_EXPENSES_LIMIT);

	const handleRowClick = (rows: SyncedExpense[]) => {
		if (rows.length === 0) return;
		const expense = rows[0];
		const d = new Date(`${expense.date.slice(0, 10)}T00:00:00`);
		const ts = d.getTime();
		navigate({
			to: "/$slug/expenses",
			params: { slug: workspace.slug },
			search: { date: `${ts}-${ts}` },
		});
	};

	if (recentExpenses.length === 0) {
		return (
			<Frame className="h-full min-h-[300px]">
				<div className="flex items-center justify-between px-6 py-4">
					<h3 className="text-lg font-semibold tracking-tight">Recent Expenses</h3>
					<Button
						variant="outline"
						size="sm"
						render={<Link to="/$slug/expenses" params={{ slug: workspace.slug }} />}
					>
						View all
					</Button>
				</div>
				<EmptyData />
			</Frame>
		);
	}

	return (
		<Frame className="h-full min-h-[300px]">
			<FrameHeader>
				<FrameTitle>Recent Expenses</FrameTitle>
			</FrameHeader>
			<div className="flex items-center justify-between px-2 py-4">
				<Button
					variant="outline"
					size="sm"
					render={<Link to="/$slug/expenses" params={{ slug: workspace.slug }} />}
				>
					View all
				</Button>
			</div>
			<DataTable data={recentExpenses} columns={columns} onRowClick={handleRowClick} />
		</Frame>
	);
}

function EmptyData() {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>No data yet</EmptyTitle>
				<EmptyDescription>You haven&apos;t created any expenses yet.</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}
