import { CurrencyValue } from "#app/components/currency-value.tsx";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import type { OccurrenceEntry } from "#app/lib/recurring.ts";
import { datetime } from "@hoalu/common/datetime";
import { Badge } from "@hoalu/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hoalu/ui/empty";
import { cn } from "@hoalu/ui/utils";
import { useNavigate } from "@tanstack/react-router";

// const REPEAT_LABEL: Record<string, string> = {
// 	daily: "Daily",
// 	weekly: "Weekly",
// 	monthly: "Monthly",
// 	yearly: "Yearly",
// 	"one-time": "One-time",
// 	custom: "Custom",
// };

interface UpcomingBillsListProps {
	bills: OccurrenceEntry[];
}

interface GroupedBills {
	label: string;
	date: string;
	entries: OccurrenceEntry[];
}

function groupByDate(bills: OccurrenceEntry[]): GroupedBills[] {
	const map = new Map<string, OccurrenceEntry[]>();
	for (const bill of bills) {
		const existing = map.get(bill.date) ?? [];
		existing.push(bill);
		map.set(bill.date, existing);
	}

	return Array.from(map.entries()).map(([date, entries]) => {
		const d = new Date(date);
		const today = new Date();
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		let label: string;
		if (d.toDateString() === today.toDateString()) {
			label = "Today";
		} else if (d.toDateString() === tomorrow.toDateString()) {
			label = "Tomorrow";
		} else {
			label = datetime.format(d, "EEE, MMM d");
		}

		return { label, date, entries };
	});
}

export function UpcomingBillsList({ bills }: UpcomingBillsListProps) {
	const workspace = useWorkspace();
	const navigate = useNavigate();
	const groups = groupByDate(bills);

	function handleBillClick(bill: OccurrenceEntry) {
		const d = new Date(bill.date);
		const ts = d.getTime();
		navigate({
			to: "/$slug/expenses",
			params: { slug: workspace.slug },
			search: { date: `${ts}-${ts}` },
		});
	}

	if (bills.length === 0) {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>No upcoming bills</EmptyTitle>
					<EmptyDescription>No recurring expenses scheduled in the next month.</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	return groups.map((group) => (
		<div key={group.date}>
			{group.entries.map((bill) => (
				<BillRow
					key={`${bill.expenseId}-${group.date}`}
					bill={bill}
					onClick={() => handleBillClick(bill)}
				/>
			))}
		</div>
	));
}

interface BillRowProps {
	bill: OccurrenceEntry;
	onClick?: () => void;
}

function BillRow({ bill, onClick }: BillRowProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"group flex w-full items-center gap-2 px-2 py-1 text-left",
				"hover:bg-muted/50 hover:border-border/50",
				// "border-b last:border-b-0 last:pb-0",
			)}
		>
			<span
				className={cn(
					"h-8 w-1 shrink-0 rounded-full",
					bill.categoryColor
						? getCategoryStripeColor(bill.categoryColor)
						: "bg-muted-foreground/30",
				)}
			/>
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm leading-tight font-medium">{bill.title}</p>
				{/* <div className="mt-0.5 flex items-center gap-1.5">
					{bill.categoryName && bill.categoryColor && (
						<Badge
							className={cn(
								"h-4 px-1 py-0 text-[9px] leading-none",
								createCategoryTheme(
									bill.categoryColor as Parameters<typeof createCategoryTheme>[0],
								),
							)}
						>
							{bill.categoryName}
						</Badge>
					)}
					<span className="text-muted-foreground text-[10px]">
						{REPEAT_LABEL[bill.repeat] ?? bill.repeat}
					</span>
					<span
						className="text-muted-foreground/60 text-[10px]"
						title={`Projected from recorded expense on ${bill.sourceDate}`}
					>
						· from {datetime.format(new Date(bill.sourceDate), "MMM d")}
					</span>
				</div> */}
			</div>

			<div className="flex gap-3">
				{bill.categoryName && bill.categoryColor && (
					<Badge
						className={cn(
							createCategoryTheme(bill.categoryColor as Parameters<typeof createCategoryTheme>[0]),
						)}
					>
						{bill.categoryName}
					</Badge>
				)}
				<CurrencyValue
					value={bill.amount}
					currency={bill.currency}
					className="shrink-0 text-sm font-semibold"
					prefix="~"
				/>
			</div>
		</button>
	);
}

const map: Record<string, string> = {
	red: "bg-red-400",
	green: "bg-emerald-400",
	teal: "bg-teal-400",
	blue: "bg-blue-400",
	yellow: "bg-amber-300",
	orange: "bg-orange-400",
	purple: "bg-violet-400",
	pink: "bg-pink-400",
	gray: "bg-slate-300",
	stone: "bg-stone-300",
};
function getCategoryStripeColor(color: string): string {
	return map[color] ?? "bg-muted-foreground/30";
}
