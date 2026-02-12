import { CurrencyValue } from "#app/components/currency-value.tsx";
import { useLiveQueryExpenses } from "#app/components/expenses/use-expenses.ts";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { Badge } from "@hoalu/ui/badge";
import { Button } from "@hoalu/ui/button";
import { Card, CardContent, CardHeader } from "@hoalu/ui/card";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";

const RECENT_EXPENSES_LIMIT = 7;

export function RecentExpenses() {
	const workspace = useWorkspace();
	const expenses = useLiveQueryExpenses();
	const recentExpenses = expenses.slice(0, RECENT_EXPENSES_LIMIT);

	if (recentExpenses.length === 0) {
		return (
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-semibold">Recent Transactions</h3>
						<Button
							variant="outline"
							size="sm"
							render={<Link to="/$slug/expenses" params={{ slug: workspace.slug }} />}
						>
							View all
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">No expenses yet</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold">Recent Transactions</h3>
					<Button
						variant="outline"
						size="sm"
						render={<Link to="/$slug/expenses" params={{ slug: workspace.slug }} />}
					>
						View all
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{recentExpenses.map((expense) => (
						<div
							key={expense.id}
							className="border-border/50 flex items-start justify-between gap-2 border-b pb-3 last:border-b-0 last:pb-0"
						>
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-medium">{expense.title}</p>
								<div className="mt-1 flex items-center gap-2">
									{expense.category?.name && expense.category?.color && (
										<Badge className={createCategoryTheme(expense.category.color)}>
											{expense.category.name}
										</Badge>
									)}
								</div>
							</div>
							<div className="shrink-0 text-right">
								<CurrencyValue
									value={expense.realAmount}
									currency={expense.currency}
									style="currency"
									className="font-semibold"
								/>
								<p className="text-muted-foreground text-xs">
									{formatDistanceToNow(new Date(expense.date), {
										addSuffix: true,
									})}
								</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
