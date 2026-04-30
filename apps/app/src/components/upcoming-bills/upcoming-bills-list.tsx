import { createExpenseDialogAtom, draftExpenseAtom, logPaymentAtom } from "#app/atoms/index.ts";
import { CurrencyValue } from "#app/components/currency-value.tsx";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { useArchiveRecurringBill } from "#app/services/mutations.ts";
import { datetime } from "@hoalu/common/datetime";
import { RepeatSchema } from "@hoalu/common/schema";
import { MoreVerticalIcon } from "@hoalu/icons/lucide";
import { Badge } from "@hoalu/ui/badge";
import { Button } from "@hoalu/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@hoalu/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hoalu/ui/empty";
import { cn } from "@hoalu/ui/utils";
import { useSetAtom } from "jotai";

export interface UpcomingBill {
	recurringBillId: string;
	date: string;
	title: string;
	amount: number;
	currency: string;
	repeat: string;
	walletId: string;
	walletName: string;
	categoryId: string | null;
	categoryName: string | null;
	categoryColor: string | null;
	isPaid: boolean;
}

interface UnifiedBillsListProps {
	overdue: UpcomingBill[];
	today: UpcomingBill[];
	upcoming: UpcomingBill[];
}

interface GroupedBills {
	label: string;
	date: string;
	isOverdue: boolean;
	entries: UpcomingBill[];
}

function groupBills(
	overdue: UpcomingBill[],
	today: UpcomingBill[],
	upcoming: UpcomingBill[],
): GroupedBills[] {
	const groups: GroupedBills[] = [];

	// Add overdue group if any
	if (overdue.length > 0) {
		// Group overdue by date
		const overdueByDate = new Map<string, UpcomingBill[]>();
		for (const bill of overdue) {
			const existing = overdueByDate.get(bill.date) ?? [];
			existing.push(bill);
			overdueByDate.set(bill.date, existing);
		}
		// Sort overdue dates ascending (oldest first)
		const sortedDates = Array.from(overdueByDate.keys()).sort();
		for (const date of sortedDates) {
			const d = new Date(`${date}T00:00:00`);
			groups.push({
				label: `Overdue · ${datetime.format(d, "MMM d, yyyy")}`,
				date,
				isOverdue: true,
				entries: overdueByDate.get(date) ?? [],
			});
		}
	}

	if (today.length > 0) {
		groups.push({
			label: "Today",
			date: new Date().toISOString().slice(0, 10),
			isOverdue: false,
			entries: today,
		});
	}

	const upcomingByDate = new Map<string, UpcomingBill[]>();
	for (const bill of upcoming) {
		const existing = upcomingByDate.get(bill.date) ?? [];
		existing.push(bill);
		upcomingByDate.set(bill.date, existing);
	}
	const sortedDates = Array.from(upcomingByDate.keys()).sort();
	for (const date of sortedDates) {
		const d = new Date(`${date}T00:00:00`);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		let label: string;
		if (d.toDateString() === tomorrow.toDateString()) {
			label = "Tomorrow";
		} else {
			label = datetime.format(d, "MMM d, yyyy");
		}

		groups.push({
			label,
			date,
			isOverdue: false,
			entries: upcomingByDate.get(date) ?? [],
		});
	}

	return groups;
}

export function UpcomingBillsList({ overdue, today, upcoming }: UnifiedBillsListProps) {
	const groups = groupBills(overdue, today, upcoming);

	if (groups.length === 0) {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>No upcoming bills</EmptyTitle>
					<EmptyDescription>No recurring expenses scheduled.</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<div className="space-y-3">
			{groups.map((group) => (
				<div key={group.isOverdue ? `overdue:${group.date}` : group.date}>
					<div className="mb-1 flex items-center gap-2">
						<span
							className={cn(
								"text-xs font-semibold",
								group.isOverdue ? "text-destructive" : "text-muted-foreground",
							)}
						>
							{group.label}
						</span>
						<div
							className={cn("h-px flex-1", group.isOverdue ? "bg-destructive/30" : "bg-border")}
						/>
					</div>
					<div className="space-y-1">
						{group.entries.map((bill) => (
							<UpcomingBillRow
								key={`${bill.recurringBillId}-${group.date}-${group.isOverdue}`}
								bill={bill}
							/>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

interface UpcomingBillRowProps {
	bill: UpcomingBill;
}

function UpcomingBillRow({ bill }: UpcomingBillRowProps) {
	const archive = useArchiveRecurringBill();
	const setDialog = useSetAtom(createExpenseDialogAtom);
	const setDraft = useSetAtom(draftExpenseAtom);
	const setLogPayment = useSetAtom(logPaymentAtom);

	function handleDelete(e: React.MouseEvent) {
		e.stopPropagation();
		archive.mutate({ id: bill.recurringBillId });
	}

	function handleLogPayment(e: React.MouseEvent) {
		e.stopPropagation();
		setDraft({
			title: bill.title,
			description: "",
			date: new Date(`${bill.date}T00:00:00`).toISOString(),
			transaction: {
				value: bill.amount,
				currency: bill.currency,
			},
			walletId: bill.walletId,
			categoryId: bill.categoryId ?? "",
			repeat: bill.repeat as RepeatSchema,
		});
		setLogPayment({ recurringBillId: bill.recurringBillId });
		setDialog({ state: true });
	}

	const isOverdue = new Date(`${bill.date}T00:00:00`) < new Date(new Date().setHours(0, 0, 0, 0));

	return (
		<div
			className={cn(
				"flex w-full items-center gap-0 overflow-hidden py-0.5 pr-1",
				isOverdue ? "hover:bg-destructive/5" : "hover:bg-muted/40",
			)}
		>
			<button
				type="button"
				onClick={handleLogPayment}
				className="flex min-w-0 flex-1 items-center gap-2 text-left"
			>
				<p
					className={cn(
						"min-w-0 flex-1 truncate text-sm font-medium",
						isOverdue && "text-destructive",
					)}
				>
					{bill.title}
				</p>
			</button>
			<div className="flex shrink-0 items-center gap-2">
				{bill.categoryName && bill.categoryColor && (
					<Badge
						className={cn(
							createCategoryTheme(bill.categoryColor as Parameters<typeof createCategoryTheme>[0]),
							"hidden md:block",
						)}
					>
						{bill.categoryName}
					</Badge>
				)}
				<CurrencyValue
					value={bill.amount}
					currency={bill.currency}
					className={cn("text-sm font-medium", isOverdue && "text-destructive")}
					prefix="≈"
				/>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={<Button variant="ghost" size="icon-sm" className="hover:bg-transparent" />}
					>
						<MoreVerticalIcon />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={handleLogPayment}>Log payment</DropdownMenuItem>
						<DropdownMenuItem onClick={handleDelete} disabled={archive.isPending}>
							Archive
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}

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
	stone: "bg-stone-300",
};

function getCategoryStripeColor(color: string): string {
	return colorMap[color] ?? "bg-muted-foreground/30";
}
