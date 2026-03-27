import { deleteEventDialogAtom, editEventDialogAtom } from "#app/atoms/dialogs.ts";
import {
	type SyncedEvent,
	useLiveQueryEventExpenses,
	useLiveQueryEventRecurringBills,
	useLiveQueryEvents,
	useSelectedEvent,
} from "#app/components/events/use-events.ts";
import { PencilIcon, Trash2Icon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { cn } from "@hoalu/ui/utils";
import { useSetAtom } from "jotai";

export function EventDetails() {
	const { event: selected } = useSelectedEvent();
	const events = useLiveQueryEvents();
	const selectedEvent = events.find((e) => e.id === selected.id) ?? null;

	if (!selectedEvent) {
		return (
			<div className="text-muted-foreground flex h-full items-center justify-center text-sm">
				Select an event to view details.
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

	const remaining = event.realBudget != null ? event.realBudget - event.totalSpent : null;
	const progress =
		event.realBudget && event.realBudget > 0
			? Math.min((event.totalSpent / event.realBudget) * 100, 100)
			: null;

	return (
		<div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
			{/* Header */}
			<div className="flex items-start justify-between gap-2">
				<div>
					<h2 className="text-lg font-semibold">{event.title}</h2>
					{(event.start_date || event.end_date) && (
						<p className="text-muted-foreground text-sm">
							{event.start_date ?? "?"} – {event.end_date ?? "ongoing"}
						</p>
					)}
				</div>
				<div className="flex gap-1">
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setEditDialog({ state: true, data: { id: event.id } })}
						aria-label="Edit event"
					>
						<PencilIcon className="size-4" />
					</Button>
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setDeleteDialog({ state: true, data: { id: event.id } })}
						aria-label="Delete event"
					>
						<Trash2Icon className="size-4" />
					</Button>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-3 gap-3">
				<StatCard label="Spent" value={`${event.budget_currency} ${event.totalSpent.toFixed(2)}`} />
				<StatCard
					label="Budget"
					value={
						event.realBudget != null
							? `${event.budget_currency} ${event.realBudget.toFixed(2)}`
							: "—"
					}
				/>
				<StatCard
					label="Remaining"
					value={remaining != null ? `${event.budget_currency} ${remaining.toFixed(2)}` : "—"}
					className={remaining != null && remaining < 0 ? "text-destructive" : ""}
				/>
			</div>

			{/* Progress bar */}
			{progress != null && (
				<div className="bg-muted h-2 w-full overflow-hidden rounded-full">
					<div
						className={cn(
							"h-full rounded-full transition-all",
							progress >= 100 ? "bg-destructive" : progress >= 80 ? "bg-orange-400" : "bg-primary",
						)}
						style={{ width: `${progress}%` }}
					/>
				</div>
			)}

			{/* Expenses list */}
			<section>
				<h3 className="mb-2 text-sm font-medium">Expenses ({expenses.length})</h3>
				{expenses.length === 0 ? (
					<p className="text-muted-foreground text-sm">No expenses linked to this event.</p>
				) : (
					<div className="flex flex-col gap-1">
						{expenses.map((exp) => (
							<div
								key={exp.id}
								className="hover:bg-muted/50 flex items-center justify-between rounded-md px-2 py-1.5 text-sm"
							>
								<span className="truncate">{exp.title}</span>
								<span className="shrink-0 font-medium">
									{exp.currency} {exp.amount.toFixed(2)}
								</span>
							</div>
						))}
					</div>
				)}
			</section>

			{bills.length > 0 && (
				<section>
					<h3 className="mb-2 text-sm font-medium">Recurring bills ({bills.length})</h3>
					<div className="flex flex-col gap-1">
						{bills.map((bill) => (
							<div
								key={bill.id}
								className="hover:bg-muted/50 flex items-center justify-between rounded-md px-2 py-1.5 text-sm"
							>
								<span className="truncate">{bill.title}</span>
								<span className="shrink-0 font-medium">
									{bill.currency} {bill.amount.toFixed(2)}
								</span>
							</div>
						))}
					</div>
				</section>
			)}
		</div>
	);
}

function StatCard({
	label,
	value,
	className,
}: {
	label: string;
	value: string;
	className?: string;
}) {
	return (
		<div className="bg-muted/50 rounded-lg p-3">
			<p className="text-muted-foreground mb-1 text-xs">{label}</p>
			<p className={cn("text-sm font-semibold", className)}>{value}</p>
		</div>
	);
}
