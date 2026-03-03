import { createExpenseDialogAtom, draftExpenseAtom, logPaymentAtom } from "#app/atoms/index.ts";
import { CurrencyValue } from "#app/components/currency-value.tsx";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { useArchiveRecurringBill } from "#app/services/mutations.ts";
import { datetime } from "@hoalu/common/datetime";
import { ArchiveIcon, MoreVerticalIcon, PlusIcon } from "@hoalu/icons/lucide";
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
import { useNavigate } from "@tanstack/react-router";
import { useSetAtom } from "jotai";

// Legacy interface for backward compatibility
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
}

// New unified interface with payment status
export interface UnifiedBill extends UpcomingBill {
	isPaid: boolean;
}

interface UpcomingBillsListProps {
	bills: UpcomingBill[];
}

interface UnifiedBillsListProps {
	overdue: UnifiedBill[];
	today: UnifiedBill[];
	upcoming: UnifiedBill[];
}

interface GroupedBills {
	label: string;
	date: string;
	isOverdue: boolean;
	entries: UnifiedBill[];
}

function groupBills(overdue: UnifiedBill[], today: UnifiedBill[], upcoming: UnifiedBill[]): GroupedBills[] {
	const groups: GroupedBills[] = [];

	// Add overdue group if any
	if (overdue.length > 0) {
		// Group overdue by date
		const overdueByDate = new Map<string, UnifiedBill[]>();
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

	// Add today group if any
	if (today.length > 0) {
		groups.push({
			label: "Today",
			date: new Date().toISOString().slice(0, 10),
			isOverdue: false,
			entries: today,
		});
	}

	// Add upcoming groups by date
	const upcomingByDate = new Map<string, UnifiedBill[]>();
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

// Legacy component for backward compatibility
export function UpcomingBillsList({ bills }: UpcomingBillsListProps) {
	const workspace = useWorkspace();
	const navigate = useNavigate();

	// Convert legacy bills to unified format
	const unifiedBills: UnifiedBill[] = bills.map(b => ({ ...b, isPaid: false }));
	const groups = groupBills([], [], unifiedBills);

	function handleBillClick(bill: UnifiedBill) {
		const d = new Date(`${bill.date}T00:00:00`);
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
					<EmptyDescription>No recurring expenses scheduled.</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<div className="space-y-3">
			{groups.map((group) => (
				<div key={group.date}>
					<div className="mb-1 flex items-center gap-2">
						<span className="text-muted-foreground text-xs font-semibold">{group.label}</span>
						<div className="bg-border h-px flex-1" />
					</div>
					<div className="space-y-1">
						{group.entries.map((bill) => (
							<BillRow
								key={`${bill.recurringBillId}-${group.date}`}
								bill={bill}
								onClick={() => handleBillClick(bill)}
							/>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

// New unified component with overdue support
export function UnifiedBillsList({ overdue, today, upcoming }: UnifiedBillsListProps) {
	const workspace = useWorkspace();
	const navigate = useNavigate();
	const groups = groupBills(overdue, today, upcoming);

	function handleBillClick(bill: UnifiedBill) {
		const d = new Date(`${bill.date}T00:00:00`);
		const ts = d.getTime();
		navigate({
			to: "/$slug/expenses",
			params: { slug: workspace.slug },
			search: { date: `${ts}-${ts}` },
		});
	}

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
							<BillRow
								key={`${bill.recurringBillId}-${group.date}-${group.isOverdue}`}
								bill={bill}
								onClick={() => handleBillClick(bill)}
							/>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

interface BillRowProps {
	bill: UnifiedBill;
	onClick?: () => void;
}

function BillRow({ bill, onClick }: BillRowProps) {
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
			repeat: bill.repeat as "one-time" | "daily" | "weekly" | "monthly" | "yearly" | "custom",
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
				onClick={onClick}
				className="flex min-w-0 flex-1 items-center gap-2 text-left"
			>
				<span
					className={cn(
						"h-8 w-1 shrink-0 rounded-full",
						isOverdue
							? "bg-destructive"
							: bill.categoryColor
								? getCategoryStripeColor(bill.categoryColor)
								: "bg-muted-foreground/30",
					)}
				/>
				<div className="min-w-0 flex-1">
					<p className={cn("truncate text-sm font-medium", isOverdue && "text-destructive")}>
						{bill.title}
					</p>
				</div>
			</button>
			<div className="flex shrink-0 items-center gap-2">
				{bill.categoryName && bill.categoryColor && (
					<Badge
						className={cn(
							createCategoryTheme(
								bill.categoryColor as Parameters<typeof createCategoryTheme>[0],
							),
						)}
					>
						{bill.categoryName}
					</Badge>
				)}
				<CurrencyValue
					value={bill.amount}
					currency={bill.currency}
					className={cn("text-sm font-semibold", isOverdue && "text-destructive")}
					prefix="~"
				/>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={<Button variant="ghost" size="icon-sm" className="hover:bg-transparent" />}
					>
						<MoreVerticalIcon />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={handleLogPayment}>
							<PlusIcon className="mr-2" />
							Log payment
						</DropdownMenuItem>
						<DropdownMenuItem onClick={handleDelete} disabled={archive.isPending}>
							<ArchiveIcon className="mr-2" />
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
