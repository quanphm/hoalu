import { toLocalISOString } from "@hoalu/datetime/datetime";
import { DotsThreeVerticalIcon } from "@hoalu/icons/phosphor";
import { Button } from "@hoalu/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@hoalu/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hoalu/ui/empty";
import { cn } from "@hoalu/ui/utils";
import { useNavigate, getRouteApi } from "@tanstack/react-router";

import { draftExpense$, logPayment$ } from "#app/atoms/index.ts";
import { ButtonLink } from "#app/components/button-link.tsx";
import { CurrencyValue } from "#app/components/currency-value.tsx";
import { formatDueDate, formatDueIn } from "#app/helpers/due-date.ts";
import { useArchiveRecurringBill } from "#app/services/mutations.ts";

import type { ProjectedBill } from "#app/components/upcoming-bills/use-billing-projection.ts";

const routeApi = getRouteApi("/_dashboard/$slug");

/** Bills shown after the overdue block, before "View N more" takes over. */
const MAX_VISIBLE_BILLS = 5;

interface UnifiedBillsListProps {
	overdue: ProjectedBill[];
	today: ProjectedBill[];
	upcoming: ProjectedBill[];
}

export function UpcomingBillsList({ overdue, today, upcoming }: UnifiedBillsListProps) {
	const overdueBills = overdue;
	const remainingBills = [...today, ...upcoming];
	const visibleBills = remainingBills.slice(0, MAX_VISIBLE_BILLS);
	const hiddenCount = remainingBills.length - visibleBills.length;
	const { slug } = routeApi.useParams();

	if (overdueBills.length === 0 && remainingBills.length === 0) {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>No upcoming bills</EmptyTitle>
					<EmptyDescription>No recurring expenses scheduled.</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	const overdueTotal = overdueBills.reduce((sum, bill) => sum + bill.amount, 0);
	const overdueCurrencies = new Set(overdueBills.map((bill) => bill.currency));
	const [overdueCurrency] = overdueCurrencies;
	// A total earns its place only when it aggregates: a lone bill would repeat
	// its own row, and amounts in different currencies have no honest sum.
	const showsOverdueTotal = overdueBills.length > 1 && overdueCurrencies.size === 1;

	return (
		<div className="flex h-full flex-col">
			{overdueBills.length > 0 && (
				<div className="border-destructive/20 bg-destructive/8 border-y">
					<div className="flex items-baseline justify-between gap-3 px-4 py-1.5">
						<span className="text-destructive text-xs font-medium tracking-wider uppercase">
							Overdue · {overdueBills.length}
						</span>
						{/* `pr-9` clears the rows' kebab slot (32px + 4px) so the total lands in their money column. */}
						{showsOverdueTotal && (
							<CurrencyValue
								value={overdueTotal}
								currency={overdueCurrency}
								className="text-destructive pr-9 text-sm font-semibold"
							/>
						)}
					</div>
					<div className="divide-destructive/10 mx-4 divide-y">
						{overdueBills.map((bill) => (
							<BillRow key={`${bill.recurringBillId}-${bill.date}`} bill={bill} isOverdue />
						))}
					</div>
				</div>
			)}

			{visibleBills.length > 0 && (
				<div className="divide-border/50 mx-4 divide-y">
					{visibleBills.map((bill) => (
						<BillRow key={`${bill.recurringBillId}-${bill.date}`} bill={bill} />
					))}
				</div>
			)}

			{hiddenCount > 0 && (
				<div className="mt-auto px-4">
					<ButtonLink
						to="/$slug/recurring-bills"
						params={{ slug }}
						variant="ghost"
						size="sm"
						className="text-muted-foreground w-full justify-center font-normal"
					>
						View {hiddenCount} more
					</ButtonLink>
				</div>
			)}
		</div>
	);
}

function BillRow({ bill, isOverdue = false }: { bill: ProjectedBill; isOverdue?: boolean }) {
	const archive = useArchiveRecurringBill();
	const { slug } = routeApi.useParams();
	const navigate = useNavigate();

	function handleLogPayment(event: React.MouseEvent) {
		event.stopPropagation();
		draftExpense$.set({
			title: bill.title,
			description: "",
			date: toLocalISOString(bill.date),
			transaction: {
				value: bill.amount,
				currency: bill.currency,
			},
			walletId: bill.walletId,
			categoryId: bill.categoryId ?? "",
			repeat: bill.repeat,
		});
		logPayment$.set({ recurringBillId: bill.recurringBillId });
		void navigate({
			to: "/$slug/transactions/new",
			params: { slug },
			search: { type: "expense" },
		});
	}

	function handleArchive(event: React.MouseEvent) {
		event.stopPropagation();
		archive.mutate({ id: bill.recurringBillId });
	}

	const category = bill.categoryName ?? "Uncategorized";
	const dueDate = formatDueDate(bill.date);
	const relative = formatDueIn(bill.daysUntil);

	return (
		<div className="group/row flex w-full items-center gap-3 py-2.5">
			<button
				type="button"
				onClick={handleLogPayment}
				aria-label={`Log payment for ${bill.title}`}
				className="focus-visible:ring-ring flex min-w-0 flex-1 flex-col gap-0.5 rounded-sm text-left outline-none focus-visible:ring-2"
			>
				<span className="text-foreground truncate text-sm font-semibold">{bill.title}</span>
				<span className="text-muted-foreground flex min-w-0 items-baseline gap-1 text-sm">
					<span className="truncate">
						{category} · {dueDate}
					</span>
					{isOverdue && <span className="text-destructive whitespace-nowrap">· {relative}</span>}
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
						render={
							<Button
								variant="ghost"
								size="icon"
								aria-label={`${bill.title} actions`}
								className={cn(
									"opacity-0 transition-[opacity,background-color] group-hover/row:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100",
									isOverdue &&
										"[@media(hover:hover)_and_(pointer:fine)]:hover:bg-destructive/15 data-pressed:bg-destructive/15",
								)}
							/>
						}
					>
						<DotsThreeVerticalIcon />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={handleLogPayment}>Log payment</DropdownMenuItem>
						<DropdownMenuItem onClick={handleArchive} disabled={archive.isPending}>
							Archive
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
