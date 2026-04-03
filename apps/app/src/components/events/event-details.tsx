import { deleteEventDialogAtom, editEventDialogAtom } from "#app/atoms/dialogs.ts";
import { CurrencyValue } from "#app/components/currency-value.tsx";
import { EventDateRange } from "#app/components/events/event-date-range.tsx";
import {
	type SyncedEvent,
	type SyncedEventBill,
	type SyncedEventExpense,
	useLiveQueryEventExpenses,
	useLiveQueryEventRecurringBills,
	useLiveQueryEvents,
	useSelectedEvent,
} from "#app/components/events/use-events.ts";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { htmlToText } from "#app/helpers/dom-parser.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { datetime } from "@hoalu/common/datetime";
import { PencilIcon, RepeatIcon, Trash2Icon } from "@hoalu/icons/lucide";
import { Badge } from "@hoalu/ui/badge";
import { Button } from "@hoalu/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@hoalu/ui/card";
import { Empty, EmptyHeader, EmptyTitle } from "@hoalu/ui/empty";
import { Progress, ProgressIndicator, ProgressTrack } from "@hoalu/ui/progress";
import { cn } from "@hoalu/ui/utils";
import { useSetAtom } from "jotai";

export function EventDetails() {
	const { event: selected } = useSelectedEvent();
	const events = useLiveQueryEvents();
	const selectedEvent = events.find((e) => e.id === selected.id) ?? null;

	if (!selectedEvent) {
		return (
			<div className="flex h-full flex-col gap-x-6 gap-y-4 overflow-auto rounded-none border border-b-0 p-0">
				<Empty>
					<EmptyHeader>
						<EmptyTitle>Select an event to view details</EmptyTitle>
					</EmptyHeader>
				</Empty>
			</div>
		);
	}

	return <EventDetailPanel event={selectedEvent} />;
}

function EventDetailPanel({ event }: { event: SyncedEvent }) {
	const expenses = useLiveQueryEventExpenses(event.id);
	const bills = useLiveQueryEventRecurringBills(event.id);
	const setEditDialog = useSetAtom(editEventDialogAtom);
	const setDeleteDialog = useSetAtom(deleteEventDialogAtom);
	const {
		metadata: { currency: workspaceCurrency },
	} = useWorkspace();

	const budgetCurrency = event.budget_currency || workspaceCurrency;
	const remaining = event.realBudget != null ? event.realBudget - event.totalSpent : null;
	const progress =
		event.realBudget && event.realBudget > 0 ? (event.totalSpent / event.realBudget) * 100 : null;
	const clampedProgress = Math.min(progress ?? 0, 100);

	return (
		<div className="flex h-full flex-col gap-x-6 gap-y-4 overflow-auto rounded-none border border-b-0 p-4">
			<div className="flex items-start justify-between gap-3">
				<div className="flex min-w-0 flex-col gap-1">
					<div className="flex items-center gap-2">
						<h2 className="truncate text-lg font-semibold">{event.title}</h2>
						<Badge variant={event.status === "open" ? "success" : "error"}>{event.status}</Badge>
					</div>
					<EventDateRange startDate={event.start_date} endDate={event.end_date} />
				</div>
				<div className="flex gap-2">
					<Button
						size="icon"
						variant="outline"
						onClick={() => setEditDialog({ state: true, data: { id: event.id } })}
						aria-label="Edit event"
					>
						<PencilIcon />
					</Button>
					<Button
						size="icon"
						variant="outline"
						onClick={() => setDeleteDialog({ state: true, data: { id: event.id } })}
						aria-label="Delete event"
					>
						<Trash2Icon />
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				<Card className="@container/card">
					<CardHeader>
						<CardDescription className="text-xs uppercase">Budget</CardDescription>
						<CardTitle className="text-xl">
							{event.realBudget > 0 ? (
								<CurrencyValue
									value={event.realBudget}
									currency={budgetCurrency}
									className="text-xl"
								/>
							) : (
								<span className="text-muted-foreground">∞</span>
							)}
						</CardTitle>
					</CardHeader>
				</Card>

				<Card className="@container/card">
					<CardHeader>
						<CardDescription className="text-xs uppercase">Spent</CardDescription>
						<CardTitle className="text-xl">
							<CurrencyValue
								value={event.totalSpent}
								currency={budgetCurrency}
								className="text-xl"
							/>
						</CardTitle>
					</CardHeader>
				</Card>

				<Card className="@container/card">
					<CardHeader>
						<CardDescription className="text-xs uppercase">Remaining</CardDescription>
						<CardTitle
							className={cn(
								"text-xl",
								remaining != null && remaining < 0
									? "text-destructive"
									: remaining != null && remaining > 0
										? "text-success"
										: "",
							)}
						>
							{remaining != null && event.realBudget > 0 ? (
								<CurrencyValue
									value={remaining}
									currency={budgetCurrency}
									className={cn(
										"text-xl",
										remaining < 0 ? "text-destructive" : remaining > 0 ? "text-success" : "",
									)}
								/>
							) : (
								<span className="text-muted-foreground">∞</span>
							)}
						</CardTitle>
					</CardHeader>
				</Card>
			</div>

			{/* Progress bar */}
			{clampedProgress != null && (
				<Progress value={clampedProgress} className="flex-row items-center gap-3">
					<ProgressTrack className="h-2 flex-1">
						<ProgressIndicator
							className={cn(
								progress! >= 100
									? "bg-destructive"
									: progress! >= 80
										? "bg-orange-400 dark:bg-orange-500"
										: "bg-emerald-500 dark:bg-emerald-400",
							)}
						/>
					</ProgressTrack>
					<span
						className={cn(
							"font-geist-mono text-xs font-medium tabular-nums",
							progress! >= 100
								? "text-destructive"
								: progress! >= 80
									? "text-orange-500 dark:text-orange-400"
									: "text-muted-foreground",
						)}
					>
						{Math.round(progress!)}%
					</span>
				</Progress>
			)}

			{/* Description */}
			{event.description && (
				<div className="text-muted-foreground rounded-md border px-3 py-2.5 text-sm leading-relaxed">
					{htmlToText(event.description)}
				</div>
			)}

			<section className="flex flex-col gap-2">
				<div className="flex items-center gap-2">
					<h3 className="text-sm font-medium">Expenses</h3>
					<Badge variant="secondary" className="text-[10px]">
						{expenses.length}
					</Badge>
				</div>
				{expenses.length === 0 ? (
					<p className="text-muted-foreground py-3 text-center text-xs">
						No expenses linked to this event.
					</p>
				) : (
					<div className="divide-border divide-y rounded-md border">
						{expenses.map((exp) => (
							<EventExpenseItem key={exp.id} expense={exp} />
						))}
					</div>
				)}
			</section>

			{bills.length > 0 && (
				<section className="flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<RepeatIcon className="text-muted-foreground size-3.5" />
						<h3 className="text-sm font-medium">Recurring Bills</h3>
						<Badge variant="secondary" className="text-[10px]">
							{bills.length}
						</Badge>
					</div>
					<div className="divide-border divide-y rounded-md border">
						{bills.map((bill) => (
							<EventBillItem key={bill.id} bill={bill} />
						))}
					</div>
				</section>
			)}
		</div>
	);
}

type CategoryInfo = {
	name: string;
	color: string;
} | null;

function EventExpenseItem({ expense }: { expense: SyncedEventExpense }) {
	const cat = (expense as Record<string, unknown>).category as CategoryInfo;

	return (
		<div
			className="hover:bg-muted/40 flex items-center justify-between gap-3 px-3 py-2 text-sm transition-colors"
			data-slot="event-expense-item"
		>
			<div className="flex min-w-0 flex-col gap-0.5">
				<span className="truncate font-medium">{expense.title}</span>
				<div className="flex items-center gap-1.5">
					{cat?.name && cat.color && (
						<Badge
							className={cn(
								createCategoryTheme(cat.color as Parameters<typeof createCategoryTheme>[0]),
							)}
						>
							{cat.name}
						</Badge>
					)}
					{expense.wallet && <span className="text-muted-foreground">{expense.wallet.name}</span>}
					{expense.date && (
						<span className="text-muted-foreground">
							· {datetime.format(new Date(expense.date), "E dd/MM/yyyy")}
						</span>
					)}
				</div>
			</div>
			<div className="shrink-0">
				<CurrencyValue
					value={expense.amount}
					currency={expense.currency}
					className="text-sm font-semibold"
				/>
			</div>
		</div>
	);
}

function EventBillItem({ bill }: { bill: SyncedEventBill }) {
	return (
		<div
			className="hover:bg-muted/40 flex items-center justify-between gap-3 px-3 py-2 text-sm transition-colors"
			data-slot="event-bill-item"
		>
			<div className="flex min-w-0 flex-col gap-0.5">
				<span className="truncate font-medium">{bill.title}</span>
				<div className="flex items-center gap-1.5">
					{bill.category_name && bill.category_color && (
						<Badge
							className={cn(
								createCategoryTheme(
									bill.category_color as Parameters<typeof createCategoryTheme>[0],
								),
							)}
						>
							{bill.category_name}
						</Badge>
					)}
					{bill.wallet_name && <span className="text-muted-foreground">{bill.wallet_name}</span>}
					<Badge variant="secondary">{bill.repeat}</Badge>
				</div>
			</div>
			<div className="shrink-0">
				<CurrencyValue
					value={bill.amount}
					currency={bill.currency}
					className="text-sm font-semibold"
				/>
			</div>
		</div>
	);
}
