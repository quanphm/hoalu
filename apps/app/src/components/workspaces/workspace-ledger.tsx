import {
	ArrowRightIcon,
	CaretDownIcon,
	CaretUpIcon,
	CheckCircleIcon,
	WarningCircleIcon,
} from "@hoalu/icons/phosphor";
import { Badge } from "@hoalu/ui/badge";
import { Button } from "@hoalu/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@hoalu/ui/empty";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@hoalu/ui/select";
import { Skeleton } from "@hoalu/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@hoalu/ui/table";
import { cn } from "@hoalu/ui/utils";
import { useValue } from "@legendapp/state/react";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";

import { redactedAmount$ } from "#app/atoms/index.ts";
import { CurrencyValue } from "#app/components/currency-value.tsx";
import {
	CreateWorkspaceForm,
	CreateWorkspaceTrigger,
	WorkspaceLogo,
} from "#app/components/workspace.tsx";
import { formatCurrency } from "#app/helpers/currency.ts";
import {
	formatSpendChange,
	LEDGER_SORTS,
	type LedgerRow,
	type LedgerSort,
} from "#app/services/workspace-ledger-model.ts";

import { useWorkspaceLedger } from "./use-workspace-ledger.ts";

import type { ReactNode } from "react";

/**
 * Sorting is the page's primary interaction, so it gets the page's one authored
 * motion: rows travel to their new order instead of jumping. Layout animation is
 * off under `prefers-reduced-motion`.
 */
const MotionTableRow = motion.create(TableRow);
const ROW_TRANSITION = { type: "spring", stiffness: 520, damping: 44, mass: 0.7 } as const;

/**
 * Secondary text sits one step below the figure it annotates. The theme's scale
 * is compact (text-xs is 10.8px), so this is the largest step that still reads as
 * a caption under a 12.6px figure.
 */
const SUB_LINE = "text-xs text-muted-foreground tabular-nums";
const SECONDARY_LABEL = "text-xs text-muted-foreground";

/** Money reaches the screen only through `CurrencyValue`, which owns redaction. */
function MoneyFacts({ row, align = "start" }: { row: LedgerRow; align?: "start" | "end" }) {
	const isRedacted = useValue(redactedAmount$);
	const [primary, ...rest] = row.currencyLines;
	const justify = align === "end" ? "justify-items-end text-right" : "justify-items-start";

	if (!primary) {
		return <span className={SECONDARY_LABEL}>Nothing recorded</span>;
	}

	// Two lines only: the figure, then its traceable in/out. Which *other*
	// currencies exist is the wallets column's business, so a row keeps one height.
	return (
		<div className={cn("grid gap-1", justify)}>
			<CurrencyValue
				value={primary.netAmount}
				prefix={primary.netAmount > 0 ? "+" : undefined}
				currency={primary.currency}
				className="text-sm font-medium"
			/>
			{!isRedacted && (
				<span className={SUB_LINE}>
					in {formatCurrency(primary.inAmount, primary.currency)} · out{" "}
					{formatCurrency(primary.outAmount, primary.currency)}
				</span>
			)}
		</div>
	);
}

function BillsFacts({ row, align = "start" }: { row: LedgerRow; align?: "start" | "end" }) {
	const { overdue, dueToday, upcoming, next } = row.bills;
	const settled = overdue === 0 && dueToday === 0 && upcoming === 0;

	return (
		<div className={cn("grid gap-1", align === "end" && "justify-items-end text-right")}>
			<span className="flex items-center gap-2">
				{overdue > 0 && <Badge variant="error">{overdue} overdue</Badge>}
				{dueToday > 0 && <Badge variant="warning">{dueToday} due today</Badge>}
				{settled && <Badge variant="success">Nothing due</Badge>}
				{!settled && upcoming > 0 && <span className={SECONDARY_LABEL}>{upcoming} upcoming</span>}
			</span>
			{next && (
				<span className={SUB_LINE}>
					{next.title} · {row.nextDueLabel}
				</span>
			)}
		</div>
	);
}

function SpendFacts({ row, align = "start" }: { row: LedgerRow; align?: "start" | "end" }) {
	if (!row.spendPreviousLabel) {
		return <span className={SECONDARY_LABEL}>No prior spend</span>;
	}

	return (
		<div className={cn("grid gap-1", align === "end" && "justify-items-end text-right")}>
			<span className="font-mono text-sm tabular-nums">
				{formatSpendChange(row.spend.changePercentage)}
			</span>
			<span className={SECONDARY_LABEL}>vs {row.spendPreviousLabel}</span>
		</div>
	);
}

function LastTouchedFacts({ row, align = "start" }: { row: LedgerRow; align?: "start" | "end" }) {
	return (
		<div className={cn("grid gap-1", align === "end" && "justify-items-end text-right")}>
			<span className={cn("text-xs", !row.hasRecordedActivity && "text-muted-foreground")}>
				{row.lastTouchedLabel}
			</span>
			{row.lastTouchedRelative && (
				<span className={SECONDARY_LABEL}>{row.lastTouchedRelative}</span>
			)}
		</div>
	);
}

function WalletCountFacts({ row, align = "start" }: { row: LedgerRow; align?: "start" | "end" }) {
	// The count is of *active* wallets, so the word says so. The currencies those
	// wallets record in live here rather than as a third line in the net cell.
	const label = row.activeWalletsCount === 0 ? "None active" : `${row.activeWalletsCount} active`;
	const currencies = row.currencyLines.map((line) => line.currency);

	return (
		<div className={cn("grid gap-1", align === "end" && "justify-items-end text-right")}>
			<span className={cn("text-xs", row.activeWalletsCount === 0 && "text-muted-foreground")}>
				{label}
			</span>
			{currencies.length > 0 && (
				<span className={cn(SECONDARY_LABEL, "font-mono")}>{currencies.join(" · ")}</span>
			)}
		</div>
	);
}

/** Label above a value — the incumbent card vocabulary, used on the phone layout. */
function Fact({
	label,
	children,
	className,
}: {
	label: string;
	children: ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("grid gap-1", className)}>
			<span className={SECONDARY_LABEL}>{label}</span>
			{children}
		</div>
	);
}

interface SortHeaderProps {
	label: string;
	value: LedgerSort;
	activeSort: LedgerSort;
	direction: LedgerSortDirection;
	onSort: (sort: LedgerSort) => void;
	className?: string;
}

function SortHeader({ label, value, activeSort, direction, onSort, className }: SortHeaderProps) {
	const isActive = value === activeSort;
	const ariaSort = direction === "asc" ? "ascending" : "descending";

	return (
		<TableHead className={className} aria-sort={isActive ? ariaSort : "none"}>
			<button
				type="button"
				onClick={() => onSort(value)}
				title={`Sort by ${label.toLowerCase()}`}
				className={cn(
					"hover:text-foreground focus-visible:ring-ring/50 -mx-2 inline-flex items-center gap-1 rounded-sm px-2 py-1 normal-case transition-colors focus-visible:ring-[3px] focus-visible:outline-none",
					// `--primary` is this world's active-sort signal. It tints the control
					// rather than the label, which would fall under the contrast floor.
					isActive && "bg-primary/10 text-foreground",
				)}
			>
				{label}
				{isActive &&
					(direction === "asc" ? (
						<CaretUpIcon className="text-primary size-3" />
					) : (
						<CaretDownIcon className="text-primary size-3" />
					))}
			</button>
		</TableHead>
	);
}

function LedgerBar({
	workspaceCount,
	visibleCount,
	sort,
	onSort,
	onSelectSort,
	needsAttentionOnly,
	onToggleAttention,
	controlsDisabled,
}: {
	workspaceCount: number;
	visibleCount: number;
	sort: LedgerSort;
	onSort: (sort: LedgerSort) => void;
	onSelectSort: (sort: LedgerSort) => void;
	needsAttentionOnly: boolean;
	onToggleAttention: (value: boolean) => void;
	/** Nothing to order when the list failed to load — don't offer controls that do nothing. */
	controlsDisabled: boolean;
}) {
	return (
		<div className="border-border flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b px-4 py-2.5">
			<h2 id="workspace-ledger-heading" className="text-sm font-semibold">
				Workspaces
				{!controlsDisabled && (
					<span className="text-muted-foreground ml-2 font-normal">
						{needsAttentionOnly
							? `${visibleCount} of ${workspaceCount} need attention`
							: `${workspaceCount === 1 ? "1 workspace" : `${workspaceCount} workspaces`} · sorted by ${LEDGER_SORTS.find((option) => option.value === sort)?.label.toLowerCase()}`}
					</span>
				)}
			</h2>
			{!controlsDisabled && (
				<div className="flex items-center gap-2">
					<Button
						variant={needsAttentionOnly ? "secondary" : "outline"}
						size="sm"
						aria-pressed={needsAttentionOnly}
						onClick={() => onToggleAttention(!needsAttentionOnly)}
					>
						Needs attention
					</Button>
					<Select
						items={LEDGER_SORTS.map((option) => ({ value: option.value, label: option.label }))}
						value={sort}
						onValueChange={(value) => value && onSelectSort(value as LedgerSort)}
					>
						<SelectTrigger size="sm" aria-label="Sort workspaces by">
							<span className="text-muted-foreground">Sort</span>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{LEDGER_SORTS.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}
		</div>
	);
}

function LedgerSkeleton() {
	return (
		<>
			<div className="hidden md:block">
				<Table>
					<TableBody>
						{[0, 1].map((index) => (
							<TableRow key={index}>
								<TableCell>
									<div className="flex items-center gap-3">
										<Skeleton className="size-8 rounded-md" />
										<Skeleton className="h-4 w-24" />
									</div>
								</TableCell>
								<TableCell>
									<Skeleton className="ml-auto h-4 w-24" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-20 rounded-full" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-16" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-14" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-20" />
								</TableCell>
								<TableCell />
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			<div className="grid gap-4 p-4 md:hidden">
				{[0, 1].map((index) => (
					<div key={index} className="grid gap-3">
						<div className="flex items-center gap-3">
							<Skeleton className="size-8 rounded-md" />
							<Skeleton className="h-4 w-24" />
						</div>
						<Skeleton className="h-4 w-40" />
					</div>
				))}
			</div>
		</>
	);
}

function LedgerMessage({
	icon,
	title,
	description,
	action,
}: {
	icon: ReactNode;
	title: string;
	description: string;
	action?: ReactNode;
}) {
	return (
		<Empty className="border-0 py-10">
			<EmptyHeader>
				<EmptyMedia variant="icon">{icon}</EmptyMedia>
				<EmptyTitle>{title}</EmptyTitle>
				<EmptyDescription>{description}</EmptyDescription>
			</EmptyHeader>
			{action && <EmptyContent>{action}</EmptyContent>}
		</Empty>
	);
}

export function WorkspaceLedger() {
	const {
		rows,
		workspaceCount,
		isPending,
		isError,
		error,
		refetch,
		sort,
		sortDirection,
		toggleSort,
		setSortKey,
		needsAttentionOnly,
		setNeedsAttentionOnly,
	} = useWorkspaceLedger();
	const reduceMotion = useReducedMotion();

	// A brand-new account gets the form, not an empty table to interpret.
	if (!isPending && !isError && workspaceCount === 0) {
		return (
			<section className="border-border bg-card max-w-xl rounded-md border p-4">
				<h2 className="text-sm font-semibold">Create a new workspace</h2>
				<p className="text-muted-foreground mt-1 mb-4 text-xs">
					A workspace holds its own wallets, categories and bills.
				</p>
				<CreateWorkspaceForm />
			</section>
		);
	}

	return (
		<section aria-labelledby="workspace-ledger-heading">
			<div className="border-border bg-card overflow-hidden rounded-md border">
				<LedgerBar
					workspaceCount={workspaceCount}
					visibleCount={rows.length}
					sort={sort}
					onSort={toggleSort}
					onSelectSort={setSortKey}
					needsAttentionOnly={needsAttentionOnly}
					onToggleAttention={setNeedsAttentionOnly}
					controlsDisabled={isError}
				/>

				{isPending && <LedgerSkeleton />}

				{!isPending && isError && (
					<LedgerMessage
						icon={<WarningCircleIcon />}
						title="Couldn't load your workspaces"
						description={error instanceof Error ? error.message : "The request failed."}
						action={
							<Button variant="outline" size="sm" onClick={() => refetch()}>
								Try again
							</Button>
						}
					/>
				)}

				{!isPending && !isError && rows.length === 0 && (
					<LedgerMessage
						icon={<CheckCircleIcon />}
						title="Nothing needs attention"
						description="Every workspace is settled and has activity recorded."
						action={
							<Button variant="outline" size="sm" onClick={() => setNeedsAttentionOnly(false)}>
								Show all workspaces
							</Button>
						}
					/>
				)}

				{!isPending && !isError && rows.length > 0 && (
					<>
						<div className="hidden md:block">
							<Table>
								<TableHeader>
									<TableRow className="bg-card hover:bg-transparent">
										<TableHead className="w-[22%]">Workspace</TableHead>
										<SortHeader
											label="Net · in − out"
											value="net"
											activeSort={sort}
											direction={sortDirection}
											onSort={toggleSort}
											className="w-[19%] text-right"
										/>
										<SortHeader
											label="Bills due"
											value="urgency"
											activeSort={sort}
											direction={sortDirection}
											onSort={toggleSort}
											className="w-[19%]"
										/>
										<SortHeader
											label="Spend (same days)"
											value="spend"
											activeSort={sort}
											direction={sortDirection}
											onSort={toggleSort}
											className="w-[14%] text-right"
										/>
										<TableHead className="w-[9%] text-right normal-case">Wallets</TableHead>
										<SortHeader
											label="Last touched"
											value="recent"
											activeSort={sort}
											direction={sortDirection}
											onSort={toggleSort}
											className="w-[13%] text-right"
										/>
										<TableHead className="w-[4%]">
											<span className="sr-only">Open</span>
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{rows.map((row) => (
										<MotionTableRow
											key={row.id}
											layout={!reduceMotion}
											transition={ROW_TRANSITION}
											className="group"
										>
											<TableCell className="py-3.5">
												<Link
													to="/$slug"
													params={{ slug: row.slug }}
													className="flex items-center gap-3 after:absolute after:inset-0 after:content-['']"
												>
													<WorkspaceLogo logo={row.logo} name={row.name} />
													<span className="grid">
														<span className="text-sm font-semibold">{row.name}</span>
														<span className="text-muted-foreground font-mono text-xs">
															{row.slug}
														</span>
													</span>
												</Link>
											</TableCell>
											<TableCell className="py-3.5">
												<MoneyFacts row={row} align="end" />
											</TableCell>
											<TableCell className="py-3.5">
												<BillsFacts row={row} />
											</TableCell>
											<TableCell className="py-3.5">
												<SpendFacts row={row} align="end" />
											</TableCell>
											<TableCell className="py-3.5">
												<WalletCountFacts row={row} align="end" />
											</TableCell>
											<TableCell className="py-3.5">
												<LastTouchedFacts row={row} align="end" />
											</TableCell>
											<TableCell className="py-3.5">
												<ArrowRightIcon
													aria-hidden="true"
													className="text-muted-foreground group-hover:text-foreground size-4 transition-transform group-hover:translate-x-0.5"
												/>
											</TableCell>
										</MotionTableRow>
									))}
								</TableBody>
							</Table>
						</div>

						<ul className="md:hidden">
							{rows.map((row) => (
								<motion.li
									key={row.id}
									layout={!reduceMotion}
									transition={ROW_TRANSITION}
									className="group border-border relative border-b last:border-b-0"
								>
									<div className="flex items-center gap-3 p-4 pb-3">
										<WorkspaceLogo logo={row.logo} name={row.name} />
										<span className="grid">
											<span className="text-sm font-semibold">{row.name}</span>
											<span className="text-muted-foreground font-mono text-xs">{row.slug}</span>
										</span>
										<ArrowRightIcon
											aria-hidden="true"
											className="text-muted-foreground ml-auto size-4"
										/>
									</div>
									<div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 pb-4">
										<Fact label="Net · in − out" className="col-span-2">
											<MoneyFacts row={row} />
										</Fact>
										<Fact label="Bills due">
											<BillsFacts row={row} />
										</Fact>
										<Fact label="Spend · same days">
											<SpendFacts row={row} />
										</Fact>
										<Fact label="Wallets">
											<WalletCountFacts row={row} />
										</Fact>
										<Fact label="Last touched">
											<LastTouchedFacts row={row} />
										</Fact>
									</div>
									<Link
										to="/$slug"
										params={{ slug: row.slug }}
										className="focus-visible:ring-ring/50 absolute inset-0 focus-visible:ring-[3px] focus-visible:outline-none"
									>
										<span className="sr-only">Open {row.name}</span>
									</Link>
								</motion.li>
							))}
						</ul>
					</>
				)}

				<CreateWorkspaceTrigger
					variant="ghost"
					className="text-muted-foreground hover:text-foreground border-border h-auto w-full justify-start gap-2 rounded-none border-t border-dashed px-4 py-3 text-sm font-normal"
				/>
			</div>
		</section>
	);
}
