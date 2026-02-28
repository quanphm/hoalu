import { CurrencyValue } from "#app/components/currency-value.tsx";
import { type SyncedExpense, useLiveQueryExpenses } from "#app/components/expenses/use-expenses.ts";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { datetime } from "@hoalu/common/datetime";
import { Badge } from "@hoalu/ui/badge";
import { Button } from "@hoalu/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@hoalu/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hoalu/ui/empty";
import { cn } from "@hoalu/ui/utils";
import { Link, useNavigate } from "@tanstack/react-router";

const RECENT_EXPENSES_LIMIT = 7;

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

interface GroupedExpenses {
	label: string;
	date: string;
	entries: SyncedExpense[];
}

function groupByDate(expenses: SyncedExpense[]): GroupedExpenses[] {
	const map = new Map<string, SyncedExpense[]>();
	for (const expense of expenses) {
		const dateKey = expense.date.slice(0, 10);
		const existing = map.get(dateKey) ?? [];
		existing.push(expense);
		map.set(dateKey, existing);
	}

	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	return Array.from(map.entries()).map(([date, entries]) => {
		const d = new Date(`${date}T00:00:00`);
		let label: string;
		if (d.toDateString() === today.toDateString()) {
			label = "Today";
		} else if (d.toDateString() === yesterday.toDateString()) {
			label = "Yesterday";
		} else {
			const sameYear = d.getFullYear() === today.getFullYear();
			label = datetime.format(d, sameYear ? "MMM d" : "MMM d, yyyy");
		}
		return { label, date, entries };
	});
}

export function RecentExpenses() {
	const workspace = useWorkspace();
	const expenses = useLiveQueryExpenses();
	const recentExpenses = expenses.slice(0, RECENT_EXPENSES_LIMIT);
	const groups = groupByDate(recentExpenses);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Recent Expenses</CardTitle>
				<CardAction>
					<Button
						variant="outline"
						size="sm"
						render={<Link to="/$slug/expenses" params={{ slug: workspace.slug }} />}
					>
						View all
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent>
				{groups.length === 0 && <EmptyData />}
				{groups.length > 0 && (
					<div className="space-y-3">
						{groups.map((group) => (
							<div key={group.date}>
								<div className="mb-1 flex items-center gap-2">
									<span className="text-muted-foreground text-xs font-semibold">{group.label}</span>
									<div className="bg-border h-px flex-1" />
								</div>
								<div className="space-y-1">
									{group.entries.map((expense) => (
										<ExpenseRow key={expense.id} expense={expense} />
									))}
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function ExpenseRow({ expense }: { expense: SyncedExpense }) {
	const workspace = useWorkspace();
	const navigate = useNavigate();

	function handleClick() {
		const d = new Date(`${expense.date.slice(0, 10)}T00:00:00`);
		const ts = d.getTime();
		navigate({
			to: "/$slug/expenses",
			params: { slug: workspace.slug },
			search: { date: `${ts}-${ts}` },
		});
	}

	return (
		<div className="hover:bg-muted/40 flex w-full items-center gap-0 overflow-hidden py-0.5 pr-1">
			<button
				type="button"
				onClick={handleClick}
				className="flex min-w-0 flex-1 items-center gap-2 text-left"
			>
				<span
					className={cn(
						"h-8 w-1 shrink-0 rounded-full",
						expense.category?.color
							? getCategoryStripeColor(expense.category.color)
							: "bg-muted-foreground/30",
					)}
				/>
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium">{expense.title}</p>
				</div>
			</button>
			<div className="flex shrink-0 items-center gap-2">
				{expense.category?.name && expense.category?.color && (
					<Badge
						className={cn(
							createCategoryTheme(
								expense.category.color as Parameters<typeof createCategoryTheme>[0],
							),
						)}
					>
						{expense.category.name}
					</Badge>
				)}
				<CurrencyValue
					value={expense.amount}
					currency={expense.currency}
					style="currency"
					className="text-sm font-semibold"
				/>
			</div>
		</div>
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
