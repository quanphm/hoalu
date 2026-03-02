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

interface UpcomingBillsListProps {
	bills: UpcomingBill[];
}

interface GroupedBills {
	label: string;
	date: string;
	entries: UpcomingBill[];
}

function groupByDate(bills: UpcomingBill[]): GroupedBills[] {
	const map = new Map<string, UpcomingBill[]>();
	for (const bill of bills) {
		const existing = map.get(bill.date) ?? [];
		existing.push(bill);
		map.set(bill.date, existing);
	}

	return Array.from(map.entries()).map(([date, entries]) => {
		const d = new Date(`${date}T00:00:00`);
		const today = new Date();
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		let label: string;
		if (d.toDateString() === today.toDateString()) {
			label = "Today";
		} else if (d.toDateString() === tomorrow.toDateString()) {
			label = "Tomorrow";
		} else {
			label = datetime.format(d, "MMM d, yyyy");
		}

		return { label, date, entries };
	});
}

export function UpcomingBillsList({ bills }: UpcomingBillsListProps) {
	const workspace = useWorkspace();
	const navigate = useNavigate();
	const groups = groupByDate(bills);

	function handleBillClick(bill: UpcomingBill) {
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

interface BillRowProps {
	bill: UpcomingBill;
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

	return (
		<div className="hover:bg-muted/40 flex w-full items-center gap-0 overflow-hidden py-0.5 pr-1">
			<button
				type="button"
				onClick={onClick}
				className="flex min-w-0 flex-1 items-center gap-2 text-left"
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
					<p className="truncate text-sm font-medium">{bill.title}</p>
				</div>
			</button>
			<div className="flex shrink-0 items-center gap-2">
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
					className="text-sm font-semibold"
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
