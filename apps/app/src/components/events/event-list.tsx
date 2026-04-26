import { EventDateRange, EventDateRangeColumn } from "#app/components/events/event-date-range.tsx";
import { type SyncedEvent, useLiveQueryEvents } from "#app/components/events/use-events.ts";
import { TransactionAmount } from "#app/components/transaction-amount.tsx";
import { GroupedVirtualTable } from "#app/components/virtual-table/grouped-virtual-table.tsx";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { Badge } from "@hoalu/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hoalu/ui/empty";
import { Progress, ProgressIndicator, ProgressTrack } from "@hoalu/ui/progress";
import { cn } from "@hoalu/ui/utils";
import { useNavigate, useParams } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, useMemo } from "react";

const percentFormatter = new Intl.NumberFormat("en-US", {
	style: "percent",
});

const GRID_TEMPLATE =
	"grid grid-cols-[1fr_var(--date-size)_var(--date-size)_var(--status-size)_var(--amount-size)_var(--amount-size)_var(--progress-size)]";

const columns: ColumnDef<SyncedEvent>[] = [
	{ id: "name", header: "Name" },
	{ id: "from_date", header: "From" },
	{ id: "to_date", header: "To" },
	{ id: "status", header: "Status" },
	{ id: "budget", header: "Budget", meta: { headerClassName: "justify-end" } },
	{ id: "spent", header: "Spent", meta: { headerClassName: "justify-end" } },
	{ id: "progress", header: "Progress" },
];

function EventContent(event: SyncedEvent) {
	const {
		metadata: { currency: workspaceCurrency },
	} = useWorkspace();

	const progress =
		event.realBudget && event.realBudget > 0
			? Math.min((event.totalSpent / event.realBudget) * 100, 999)
			: null;

	const progressColor =
		progress == null
			? ""
			: progress >= 100
				? "bg-destructive"
				: progress >= 80
					? "bg-orange-400 dark:bg-orange-500"
					: "bg-emerald-500 dark:bg-emerald-400";

	const progressTextColor =
		progress == null
			? ""
			: progress >= 100
				? "text-destructive"
				: progress >= 80
					? "text-orange-500 dark:text-orange-400"
					: "text-muted-foreground";

	return (
		<>
			<div className="flex items-center truncate px-4 py-3">
				<p
					className={cn(
						"truncate text-sm font-medium",
						event.status === "closed" && "text-muted-foreground",
					)}
					title={event.title}
				>
					{event.title}
				</p>
			</div>
			<EventDateRangeColumn
				startDate={event.start_date}
				endDate={event.end_date}
				className={cn(event.status === "closed" && "text-muted-foreground")}
			/>
			<div className="flex items-center px-4 py-3">
				{event.status === "open" ? (
					<Badge variant="outline" className="text-success border-success/30 bg-success/10">
						Open
					</Badge>
				) : (
					<Badge variant="outline" className="text-muted-foreground">
						Closed
					</Badge>
				)}
			</div>
			<div className="flex items-center justify-end px-4 py-3">
				{event.realBudget ? (
					<TransactionAmount
						data={{
							amount: event.budget,
							convertedAmount: event.realBudget,
							currency: event.budget_currency || workspaceCurrency,
						}}
						className={cn(
							"text-sm font-medium",
							event.status === "closed" && "text-muted-foreground",
						)}
					/>
				) : (
					<span className="text-muted-foreground text-sm">-</span>
				)}
			</div>
			<div className="flex items-center justify-end px-4 py-3">
				<TransactionAmount
					type="expense"
					data={{
						amount: event.totalSpent,
						convertedAmount: event.totalSpent,
						currency: event.budget_currency || workspaceCurrency,
					}}
					className={cn(
						"text-sm font-medium",
						event.status === "closed" && "text-muted-foreground",
					)}
				/>
			</div>
			<div className="flex items-center gap-2 px-4 py-3">
				{progress != null ? (
					<Progress value={Math.min(progress, 100)} className="flex-row items-center gap-1.5">
						<ProgressTrack className="h-1.5 flex-1">
							<ProgressIndicator className={progressColor} />
						</ProgressTrack>
						<span
							className={cn(
								"w-8 text-right text-[10px] font-medium tabular-nums",
								progressTextColor,
							)}
						>
							{percentFormatter.format(progress / 100)}
						</span>
					</Progress>
				) : (
					<span className="text-muted-foreground text-sm">-</span>
				)}
			</div>
		</>
	);
}

const emptyState = (
	<Empty>
		<EmptyHeader>
			<EmptyTitle>No events</EmptyTitle>
			<EmptyDescription>Create your first event to group expenses and bills.</EmptyDescription>
		</EmptyHeader>
	</Empty>
);

function EventList() {
	const events = useLiveQueryEvents();
	const navigate = useNavigate();
	const { slug } = useParams({ from: "/_dashboard/$slug" });

	const sortedEvents = useMemo(
		() =>
			[...events].sort((a, b) => {
				if (!a.start_date && !b.start_date) return 0;
				if (!a.start_date) return 1;
				if (!b.start_date) return -1;
				return b.start_date.localeCompare(a.start_date);
			}),
		[events],
	);

	const handleSelect = useCallback(
		(id: string | null) => {
			if (!id) {
				navigate({ to: "/$slug/events", params: { slug } });
				return;
			}
			navigate({ to: "/$slug/events/$eventId", params: { slug, eventId: id } }); // id is public_id via getItemId
		},
		[navigate, slug],
	);

	const renderRow = useCallback(
		(item: SyncedEvent, _isSelected: boolean) => <EventContent {...item} />,
		[],
	);

	return (
		<GroupedVirtualTable<SyncedEvent>
			items={sortedEvents}
			getItemId={(e) => e.public_id}
			columns={columns}
			gridTemplate={GRID_TEMPLATE}
			renderRow={renderRow}
			estimateRowSize={45}
			onSelectItem={handleSelect}
			enableKeyboardNav={true}
			emptyState={emptyState}
		/>
	);
}

export default memo(EventList);
