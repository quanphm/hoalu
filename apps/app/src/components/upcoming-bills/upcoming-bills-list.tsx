import { datetime, toLocalISOString, TIME_IN_MILLISECONDS } from "@hoalu/datetime/datetime";
import { DotsThreeVerticalIcon } from "@hoalu/icons/phosphor";
import { RepeatSchema } from "@hoalu/schema/schema";
import { Button } from "@hoalu/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@hoalu/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hoalu/ui/empty";
import { ScrollArea } from "@hoalu/ui/scroll-area";
import { useNavigate, getRouteApi } from "@tanstack/react-router";

import { draftExpense$, logPayment$ } from "#app/atoms/index.ts";
import { CurrencyValue } from "#app/components/currency-value.tsx";
import { useArchiveRecurringBill } from "#app/services/mutations.ts";

const routeApi = getRouteApi("/_dashboard/$slug");

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

function getDaysDiff(dateStr: string): number {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const due = new Date(`${dateStr}T00:00:00`);
	return Math.round((due.getTime() - today.getTime()) / TIME_IN_MILLISECONDS.DAY);
}

function formatDueDate(dateStr: string): string {
	return datetime.format(new Date(`${dateStr}T00:00:00`), "MMM d");
}

interface FlatBill extends UpcomingBill {
	status: "overdue" | "today" | "upcoming";
	daysDiff: number;
}

function flattenBills(
	overdue: UpcomingBill[],
	today: UpcomingBill[],
	upcoming: UpcomingBill[],
): FlatBill[] {
	const bills: FlatBill[] = [];

	for (const bill of overdue) {
		bills.push({ ...bill, status: "overdue", daysDiff: getDaysDiff(bill.date) });
	}
	for (const bill of today) {
		bills.push({ ...bill, status: "today", daysDiff: 0 });
	}
	for (const bill of upcoming) {
		bills.push({ ...bill, status: "upcoming", daysDiff: getDaysDiff(bill.date) });
	}

	return bills;
}

export function UpcomingBillsList({ overdue, today, upcoming }: UnifiedBillsListProps) {
	const bills = flattenBills(overdue, today, upcoming);

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

	const overdueBills = bills.filter((b) => b.status === "overdue");
	const remainingBills = bills.filter((b) => b.status !== "overdue");

	const overdueTotal = overdueBills.reduce((sum, b) => sum + b.amount, 0);
	const overdueCurrency = overdueBills[0]?.currency ?? "VND";

	return (
		<ScrollArea className="min-h-90 px-4">
			{/* Overdue section */}
			{overdueBills.length > 0 && (
				<div className="border-destructive/20 bg-destructive/8 dark:bg-destructive/12 rounded-lg border">
					{/* Header */}
					<div className="border-destructive/10 flex items-center justify-between border-b px-4 py-2.5">
						<span className="text-destructive text-xs font-semibold tracking-wider uppercase">
							Overdue · {overdueBills.length}
						</span>
						<CurrencyValue
							value={overdueTotal}
							currency={overdueCurrency}
							className="text-destructive text-xs font-semibold"
						/>
					</div>
					{/* Items */}
					<div className="divide-destructive/10 divide-y px-4">
						{overdueBills.map((bill) => (
							<OverdueBillRow key={`${bill.recurringBillId}-${bill.date}`} bill={bill} />
						))}
					</div>
				</div>
			)}

			{/* Upcoming section */}
			{remainingBills.length > 0 && (
				<div className="divide-border/50 mt-4 divide-y px-4">
					{remainingBills.map((bill) => (
						<UpcomingBillRow key={`${bill.recurringBillId}-${bill.date}`} bill={bill} />
					))}
				</div>
			)}
		</ScrollArea>
	);
}

function OverdueBillRow({ bill }: { bill: FlatBill }) {
	const archive = useArchiveRecurringBill();
	const { slug } = routeApi.useParams();
	const navigate = useNavigate();
	const setDraft = draftExpense$.set;
	const setLogPayment = logPayment$.set;

	function handleLogPayment(e: React.MouseEvent) {
		e.stopPropagation();
		setDraft({
			title: bill.title,
			description: "",
			date: toLocalISOString(bill.date),
			transaction: {
				value: bill.amount,
				currency: bill.currency,
			},
			walletId: bill.walletId,
			categoryId: bill.categoryId ?? "",
			repeat: bill.repeat as RepeatSchema,
		});
		setLogPayment({ recurringBillId: bill.recurringBillId });
		navigate({
			to: "/$slug/transactions/new",
			params: { slug },
			search: { type: "expense" },
		});
	}

	function handleDelete(e: React.MouseEvent) {
		e.stopPropagation();
		archive.mutate({ id: bill.recurringBillId });
	}

	const daysLate = Math.abs(bill.daysDiff);

	return (
		<div className="flex w-full items-center gap-3 py-3">
			<button
				type="button"
				onClick={handleLogPayment}
				className="flex min-w-0 flex-1 flex-col gap-0.5 text-left"
			>
				<span className="text-foreground truncate text-sm font-semibold">{bill.title}</span>
				<span className="text-muted-foreground truncate text-xs">
					{bill.categoryName ?? "Uncategorized"} · due {formatDueDate(bill.date)} ·{" "}
					<span className="text-destructive">
						{daysLate} day{daysLate !== 1 ? "s" : ""} late
					</span>
				</span>
			</button>
			<div className="flex shrink-0 items-center gap-1">
				<CurrencyValue
					value={bill.amount}
					currency={bill.currency}
					className="text-destructive text-sm font-semibold"
				/>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={<Button variant="ghost" size="icon-sm" className="hover:bg-transparent" />}
					>
						<DotsThreeVerticalIcon />
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

function UpcomingBillRow({ bill }: { bill: FlatBill }) {
	const archive = useArchiveRecurringBill();
	const { slug } = routeApi.useParams();
	const navigate = useNavigate();
	const setDraft = draftExpense$.set;
	const setLogPayment = logPayment$.set;

	function handleLogPayment(e: React.MouseEvent) {
		e.stopPropagation();
		setDraft({
			title: bill.title,
			description: "",
			date: toLocalISOString(bill.date),
			transaction: {
				value: bill.amount,
				currency: bill.currency,
			},
			walletId: bill.walletId,
			categoryId: bill.categoryId ?? "",
			repeat: bill.repeat as RepeatSchema,
		});
		setLogPayment({ recurringBillId: bill.recurringBillId });
		navigate({
			to: "/$slug/transactions/new",
			params: { slug },
			search: { type: "expense" },
		});
	}

	function handleDelete(e: React.MouseEvent) {
		e.stopPropagation();
		archive.mutate({ id: bill.recurringBillId });
	}

	const daysLabel =
		bill.status === "today" ? "today" : `in ${bill.daysDiff} day${bill.daysDiff !== 1 ? "s" : ""}`;

	return (
		<div className="flex w-full items-center gap-3 py-3">
			<button
				type="button"
				onClick={handleLogPayment}
				className="flex min-w-0 flex-1 flex-col gap-0.5 text-left"
			>
				<span className="text-foreground truncate text-sm font-semibold">{bill.title}</span>
				<span className="text-muted-foreground truncate text-xs">
					{bill.categoryName ?? "Uncategorized"} · {formatDueDate(bill.date)} · {daysLabel}
				</span>
			</button>
			<div className="flex shrink-0 items-center gap-1">
				<CurrencyValue
					value={bill.amount}
					currency={bill.currency}
					className="text-sm font-semibold"
				/>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={<Button variant="ghost" size="icon-sm" className="hover:bg-transparent" />}
					>
						<DotsThreeVerticalIcon />
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
