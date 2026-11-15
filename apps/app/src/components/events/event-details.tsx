import { datetime } from "@hoalu/datetime/datetime";
import { CaretDownIcon, CaretUpIcon, RepeatIcon, TrashIcon } from "@hoalu/icons/phosphor";
import { Badge } from "@hoalu/ui/badge";
import { Button } from "@hoalu/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@hoalu/ui/card";
import { Progress, ProgressIndicator, ProgressTrack } from "@hoalu/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hoalu/ui/tooltip";
import { cn } from "@hoalu/ui/utils";

import { deleteEventDialog } from "#app/atoms/dialogs.ts";
import { CurrencyValue } from "#app/components/currency-value.tsx";
import { EventEditForm } from "#app/components/events/event-edit.tsx";
import {
	type SyncedEvent,
	type SyncedEventBill,
	type SyncedEventExpense,
	useLiveQueryEventExpenses,
	useLiveQueryEventRecurringBills,
} from "#app/components/events/use-events.ts";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";

interface EventDetailPanelProps {
	event: SyncedEvent;
	onClose: () => void;
	onGoUp: () => void;
	onGoDown: () => void;
	canGoUp: boolean;
	canGoDown: boolean;
}

export function EventDetailPanel({
	event,
	onClose,
	onGoUp,
	onGoDown,
	canGoUp,
	canGoDown,
}: EventDetailPanelProps) {
	const setDeleteDialog = deleteEventDialog.set;

	const headerActions = (
		<>
			<Tooltip>
				<TooltipTrigger
					render={
						<Button size="icon-sm" variant="outline" onClick={onGoDown} disabled={!canGoDown} />
					}
				>
					<CaretDownIcon />
				</TooltipTrigger>
				<TooltipContent side="bottom">Down (J)</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger
					render={<Button size="icon-sm" variant="outline" onClick={onGoUp} disabled={!canGoUp} />}
				>
					<CaretUpIcon />
				</TooltipTrigger>
				<TooltipContent side="bottom">Up (K)</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							size="icon-sm"
							variant="outline"
							aria-label="Delete event"
							onClick={() => setDeleteDialog({ state: true, data: { id: event.id } })}
						/>
					}
				>
					<TrashIcon />
				</TooltipTrigger>
				<TooltipContent side="bottom">Delete</TooltipContent>
			</Tooltip>
		</>
	);

	return (
		<div className="bg-background overflow-auto max-md:h-auto md:h-[calc(100dvh-94px)]">
			<EventEditForm key={event.id} event={event} headerActions={headerActions} onClose={onClose}>
				<EventReadouts event={event} />
			</EventEditForm>
		</div>
	);
}

/** Everything the event has accumulated; the budget itself is the editable figure above. */
function EventReadouts({ event }: { event: SyncedEvent }) {
	const expenses = useLiveQueryEventExpenses(event.id);
	const bills = useLiveQueryEventRecurringBills(event.id);
	const {
		metadata: { currency: workspaceCurrency },
	} = useWorkspace();

	const budgetCurrency = event.budget_currency || workspaceCurrency;
	const remaining = event.realBudget != null ? event.realBudget - event.totalSpent : null;
	const progress =
		event.realBudget && event.realBudget > 0 ? (event.totalSpent / event.realBudget) * 100 : 0;
	const clampedProgress = Math.min(progress, 100);

	return (
		<div className="flex flex-col gap-4">
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
								<span className="text-muted-foreground">-</span>
							)}
						</CardTitle>
					</CardHeader>
				</Card>
			</div>

			{!!clampedProgress && (
				<Progress value={clampedProgress} className="flex-row items-center gap-3">
					<ProgressTrack className="h-2 flex-1">
						<ProgressIndicator
							className={cn(
								progress >= 100
									? "bg-destructive"
									: progress >= 80
										? "bg-orange-400 dark:bg-orange-500"
										: "bg-emerald-500 dark:bg-emerald-400",
							)}
						/>
					</ProgressTrack>
					<span
						className={cn(
							"font-mono text-xs font-medium tabular-nums",
							progress >= 100
								? "text-destructive"
								: progress >= 80
									? "text-orange-500 dark:text-orange-400"
									: "text-muted-foreground",
						)}
					>
						{Math.round(progress)}%
					</span>
				</Progress>
			)}

			<section className="flex flex-col gap-2">
				<div className="flex items-center gap-2">
					<h3 className="text-sm font-medium">Expenses</h3>
					<Badge variant="secondary" className="text-2xs">
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
						<Badge variant="secondary" className="text-2xs">
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
					className="text-sm font-medium"
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
					className="text-sm font-medium"
				/>
			</div>
		</div>
	);
}
