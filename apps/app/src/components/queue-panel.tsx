import { createExpenseDialogAtom, scanQueueReviewDialogAtom } from "#app/atoms/dialogs.ts";
import { draftExpenseAtom, quickExpenseJobIdAtom } from "#app/atoms/expenses.ts";
import { useQuickExpenseQueue, useReceiptScanQueue } from "#app/hooks/use-queue.ts";
import {
	ChevronDownIcon,
	Loader2Icon,
	ReceiptIcon,
	RefreshCwIcon,
	ZapIcon,
} from "@hoalu/icons/lucide";
import { XIcon } from "@hoalu/icons/tabler";
import { Button } from "@hoalu/ui/button";
import { cn } from "@hoalu/ui/utils";
import { useSetAtom } from "jotai";
import { useState } from "react";

import { CurrencyValue } from "./currency-value";

import type { QuickExpenseJob } from "#app/lib/queues/quick-expense-queue.ts";
import type { ReceiptScanJob } from "#app/lib/queues/receipt-scan-queue.ts";

type JobStatus = "pending" | "processing" | "completed" | "failed" | "dismissed";

function formatBytes(bytes: number): string {
	if (!bytes) return "0 KB";
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function JobStatusBadge({ status, retryCount }: { status: JobStatus; retryCount: number }) {
	const base =
		"font-geist-mono inline-flex shrink-0 origin-left scale-85 items-center gap-1 rounded-sm px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider";

	if (status === "processing") {
		return (
			<span className={cn(base, "bg-primary/15 text-primary")}>
				<Loader2Icon className="size-2.5 animate-spin" />
				Scanning
			</span>
		);
	}
	if (status === "pending") {
		return <span className={cn(base, "bg-muted text-muted-foreground")}>Queued</span>;
	}
	if (status === "completed") {
		return <span className={cn(base, "bg-info/15 text-info")}>Needs review</span>;
	}
	if (status === "failed") {
		return (
			<span className={cn(base, "bg-destructive/15 text-destructive")}>
				{retryCount > 0 ? `Failed · retry ${retryCount}` : "Failed"}
			</span>
		);
	}
	return null;
}

function ReceiptJobItem({ job }: { job: ReceiptScanJob }) {
	const { retry, remove } = useReceiptScanQueue();
	const setReviewDialog = useSetAtom(scanQueueReviewDialogAtom);

	const handleReview = () => {
		setReviewDialog({ state: true, data: { jobId: job.id } });
	};

	const data = job.result?.data;
	const currency = data?.currency || "VND";

	return (
		<div className="bg-card flex min-w-0 gap-2.5 border-r p-3 last:border-r-transparent">
			<div className="bg-muted relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-sm border">
				{job.input.previewBase64 ? (
					<img
						src={job.input.previewBase64}
						alt={job.input.fileName}
						className="h-full w-full object-cover"
					/>
				) : (
					<ReceiptIcon className="text-muted-foreground size-4" />
				)}
				{job.status === "processing" && (
					<div className="bg-primary shadow-primary/60 animate-scanline absolute inset-x-0 h-[2px] shadow-[0_0_6px]" />
				)}
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-1.5">
					<span className="truncate text-xs font-medium">{job.input.fileName}</span>
					<JobStatusBadge status={job.status} retryCount={job.retryCount} />
					<Button
						size="xs"
						variant="ghost"
						onClick={() => remove(job.id)}
						title="Remove"
						className="ml-auto shrink-0"
					>
						<XIcon />
					</Button>
				</div>

				<div className="font-geist-mono text-muted-foreground text-xs">
					{formatBytes(job.input.fileSize)}
				</div>

				{job.status === "completed" && data && (
					<div className="mt-1 flex items-center gap-1.5">
						<span className="text-muted-foreground flex-1 truncate text-xs">
							{data.merchantName || "Receipt"}
						</span>
						<CurrencyValue
							value={data.amount}
							currency={currency}
							className="text-xs font-semibold"
						/>
						<Button variant="default" size="xs" onClick={handleReview}>
							Review
						</Button>
					</div>
				)}
				{job.status === "failed" && (
					<div className="mt-1 flex items-center gap-1">
						<span className="text-destructive flex-1 truncate text-xs">
							{job.errorMessage || "Unknown error"}
						</span>
						<Button variant="outline" size="xs" onClick={() => retry(job.id)}>
							<RefreshCwIcon />
							Retry
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

function QuickExpenseJobItem({ job }: { job: QuickExpenseJob }) {
	const { retry, remove } = useQuickExpenseQueue();
	const setDraft = useSetAtom(draftExpenseAtom);
	const setQuickExpenseJobId = useSetAtom(quickExpenseJobIdAtom);
	const setCreateDialog = useSetAtom(createExpenseDialogAtom);

	const handleReview = () => {
		if (!job.result) return;
		setDraft((draft) => ({
			...draft,
			title: job.result!.title,
			description: "",
			date: new Date(job.result!.date).toISOString(),
			transaction: { value: job.result!.amount, currency: job.result!.currency },
			walletId: job.result!.suggestedWalletId ?? "",
			categoryId: job.result!.suggestedCategoryId ?? "",
			repeat: job.result!.repeat,
		}));
		setQuickExpenseJobId(job.id);
		setCreateDialog({ state: true });
	};

	const result = job.result;
	const currency = result?.currency || "VND";

	return (
		<div className="bg-card flex min-w-0 gap-2.5 border-r p-3 last:border-r-transparent">
			<div className="bg-muted relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-sm border">
				<ZapIcon className="text-muted-foreground size-4" />
				{job.status === "processing" && (
					<div className="bg-primary shadow-primary/60 animate-scanline absolute inset-x-0 h-[2px] shadow-[0_0_6px]" />
				)}
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-1.5">
					<span className="truncate text-xs font-medium">{job.input.text}</span>
					<JobStatusBadge status={job.status} retryCount={job.retryCount} />
					<Button
						size="xs"
						variant="ghost"
						title="Remove"
						onClick={() => remove(job.id)}
						className="ml-auto shrink-0"
					>
						<XIcon />
					</Button>
				</div>
				<div className="text-muted-foreground text-xs">Quick entry</div>
				{job.status === "completed" && result && (
					<div className="mt-1 flex items-center gap-1.5">
						<span className="text-muted-foreground flex-1 truncate text-xs">{result.title}</span>
						<CurrencyValue
							value={result.amount}
							currency={currency}
							className="text-xs font-semibold"
						/>
						<Button variant="default" size="xs" onClick={handleReview}>
							Review
						</Button>
					</div>
				)}
				{job.status === "failed" && (
					<div className="mt-1 flex items-center gap-1">
						<span className="text-destructive flex-1 truncate text-xs">
							{job.errorMessage || "Unknown error"}
						</span>
						<Button variant="outline" size="xs" onClick={() => retry(job.id)}>
							<RefreshCwIcon />
							Retry
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

export function QueuePanel() {
	const [collapsed, setCollapsed] = useState(true);
	const {
		activeJobs: receiptJobs,
		processing: receiptProcessing,
		completed: receiptCompleted,
		failed: receiptFailed,
	} = useReceiptScanQueue();
	const {
		activeJobs: quickJobs,
		processing: quickProcessing,
		completed: quickCompleted,
		failed: quickFailed,
	} = useQuickExpenseQueue();

	const processingCount = receiptProcessing.length + quickProcessing.length;
	const needsReviewCount = receiptCompleted.length + quickCompleted.length;
	const failedCount = receiptFailed.length + quickFailed.length;
	const totalActive = receiptJobs.length + quickJobs.length;
	const hasActivity = processingCount > 0;
	const isEmpty = totalActive === 0;

	return (
		<div className="bg-card col-span-full overflow-hidden">
			<button
				type="button"
				onClick={() => setCollapsed((c) => !c)}
				className="hover:bg-accent/30 flex h-9 w-full items-center gap-4 px-3 text-left transition-colors"
			>
				<div className="flex items-center gap-2">
					<span
						className={cn(
							"size-1.5 rounded-full",
							hasActivity
								? "bg-primary ring-primary/20 animate-pulse ring-2"
								: "bg-muted-foreground/60",
						)}
					/>
					<span className="font-geist-mono text-muted-foreground text-xs font-medium tracking-wider uppercase">
						Jobs
					</span>
				</div>

				<div className="font-geist-mono flex items-center gap-4 text-xs tracking-tight">
					<span className={processingCount > 0 ? "text-primary" : "text-muted-foreground"}>
						<b className="font-semibold tabular-nums">{processingCount}</b> processing
					</span>
					{needsReviewCount > 0 && (
						<span className="text-info">
							<b className="font-semibold tabular-nums">{needsReviewCount}</b> needs review
						</span>
					)}
					{failedCount > 0 && (
						<span className="text-destructive">
							<b className="font-semibold tabular-nums">{failedCount}</b> failed
						</span>
					)}
				</div>

				<div className="flex-1" />

				<span className="text-muted-foreground text-xs uppercase">
					{collapsed ? "Show" : "Hide"}
				</span>
				<ChevronDownIcon
					className={cn(
						"text-muted-foreground size-3 transition-transform",
						collapsed && "-rotate-90",
					)}
				/>
			</button>

			{!collapsed && (
				<div className="border-t">
					{isEmpty ? (
						<div className="text-muted-foreground flex h-23 w-full items-center justify-center text-xs tracking-wider uppercase">
							No active jobs
						</div>
					) : (
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
							{receiptJobs.map((job) => (
								<ReceiptJobItem key={job.id} job={job} />
							))}
							{quickJobs.map((job) => (
								<QuickExpenseJobItem key={job.id} job={job} />
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
