import { createExpenseDialogAtom, scanQueueReviewDialogAtom } from "#app/atoms/dialogs.ts";
import { draftExpenseAtom } from "#app/atoms/expenses.ts";
import { useReceiptScanQueue, useQuickExpenseQueue } from "#app/hooks/use-queue.ts";
import {
	Loader2Icon,
	AlertCircleIcon,
	RefreshCwIcon,
	EyeIcon,
	ReceiptIcon,
	ZapIcon,
} from "@hoalu/icons/lucide";
import { XIcon, CheckIcon } from "@hoalu/icons/tabler";
import { Button } from "@hoalu/ui/button";
import { cn } from "@hoalu/ui/utils";
import { useSetAtom } from "jotai";

import type { QuickExpenseJob } from "#app/lib/queues/quick-expense-queue.ts";
import type { ReceiptScanJob } from "#app/lib/queues/receipt-scan-queue.ts";

type JobStatus = "pending" | "processing" | "completed" | "failed" | "dismissed";

function JobStatusIcon({ status }: { status: JobStatus }) {
	switch (status) {
		case "pending":
			return <div className="bg-muted-foreground/20 size-3 rounded-full" />;
		case "processing":
			return <Loader2Icon className="text-primary size-3 animate-spin" />;
		case "completed":
			return <CheckIcon className="text-success size-3" />;
		case "failed":
			return <AlertCircleIcon className="text-destructive size-3" />;
		case "dismissed":
			return null;
		default:
			return null;
	}
}

function JobStatusLabel({ status, retryCount }: { status: JobStatus; retryCount: number }) {
	return (
		<span
			className={cn(
				"text-[10px]",
				status === "failed" && "text-destructive",
				status === "completed" && "text-green-600",
				status === "processing" && "text-primary",
				status === "pending" && "text-muted-foreground",
			)}
		>
			{status === "pending" && "Waiting"}
			{status === "processing" && "Processing"}
			{status === "completed" && "Ready"}
			{status === "failed" && (retryCount > 0 ? `Failed (retry ${retryCount})` : "Failed")}
		</span>
	);
}

function ReceiptJobItem({ job }: { job: ReceiptScanJob }) {
	const { retry, dismiss, remove } = useReceiptScanQueue();
	const setReviewDialog = useSetAtom(scanQueueReviewDialogAtom);

	const handleReview = () => {
		setReviewDialog({ state: true, data: { jobId: job.id } });
	};

	return (
		<div className="bg-card flex min-h-[66px] items-center gap-2 rounded-md border p-2">
			<div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-sm">
				{job.input.previewBase64 ? (
					<img
						src={job.input.previewBase64}
						alt={job.input.fileName}
						className="h-full w-full object-cover"
					/>
				) : (
					<ReceiptIcon className="text-muted-foreground size-4" />
				)}
			</div>

			<div className="min-w-0 flex-1">
				<p className="truncate text-xs font-medium">{job.input.fileName}</p>
				<div className="flex items-center gap-1">
					<JobStatusIcon status={job.status} />
					<JobStatusLabel status={job.status} retryCount={job.retryCount} />
				</div>
			</div>

			<div className="flex flex-col items-center">
				{job.status === "completed" && (
					<>
						<Button variant="ghost" size="icon-sm" onClick={handleReview} title="Review">
							<EyeIcon />
						</Button>
						<Button variant="ghost" size="icon-sm" onClick={() => remove(job.id)} title="Remove">
							<XIcon />
						</Button>
					</>
				)}
				{job.status === "failed" && (
					<>
						<Button variant="ghost" size="icon-sm" onClick={() => retry(job.id)} title="Retry">
							<RefreshCwIcon />
						</Button>
						<Button
							variant="ghost"
							size="icon-sm"
							className="text-destructive hover:text-destructive"
							onClick={() => dismiss(job.id)}
							title="Dismiss"
						>
							<XIcon />
						</Button>
					</>
				)}
				{(job.status === "pending" || job.status === "dismissed") && (
					<Button variant="ghost" size="icon-sm" onClick={() => remove(job.id)} title="Remove">
						<XIcon />
					</Button>
				)}
			</div>
		</div>
	);
}

function QuickExpenseJobItem({ job }: { job: QuickExpenseJob }) {
	const { retry, dismiss, remove } = useQuickExpenseQueue();
	const setDraft = useSetAtom(draftExpenseAtom);
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
		setCreateDialog({ state: true });
	};

	return (
		<div className="bg-card flex min-h-[66px] items-center gap-2 rounded-md border p-2">
			<div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-sm">
				<ZapIcon className="text-muted-foreground size-4" />
			</div>

			<div className="min-w-0 flex-1">
				<p className="truncate text-xs font-medium">{job.input.text}</p>
				<div className="flex items-center gap-1">
					<JobStatusIcon status={job.status} />
					<JobStatusLabel status={job.status} retryCount={job.retryCount} />
				</div>
			</div>

			<div className="flex flex-col items-center">
				{job.status === "completed" && (
					<>
						<Button variant="ghost" size="icon-sm" onClick={handleReview} title="Review">
							<EyeIcon />
						</Button>
						<Button variant="ghost" size="icon-sm" onClick={() => remove(job.id)} title="Remove">
							<XIcon />
						</Button>
					</>
				)}
				{job.status === "failed" && (
					<>
						<Button variant="ghost" size="icon-sm" onClick={() => retry(job.id)} title="Retry">
							<RefreshCwIcon />
						</Button>
						<Button
							variant="ghost"
							size="icon-sm"
							className="text-destructive hover:text-destructive"
							onClick={() => dismiss(job.id)}
							title="Dismiss"
						>
							<XIcon />
						</Button>
					</>
				)}
				{(job.status === "pending" || job.status === "dismissed") && (
					<Button variant="ghost" size="icon-sm" onClick={() => remove(job.id)} title="Remove">
						<XIcon />
					</Button>
				)}
			</div>
		</div>
	);
}

function EmptyJobPlaceholder() {
	return Array(1)
		.fill(null)
		.map((_, i) => (
			<div
				key={i}
				className="bg-muted/30 flex items-center gap-2 rounded-md border border-dashed p-3"
			>
				<div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-sm" />
				<div className="min-w-0 flex-1">
					<p className="text-muted-foreground/60 truncate text-xs font-medium">No items</p>
				</div>
			</div>
		));
}

export function QueuePanel() {
	const { activeJobs } = useReceiptScanQueue();
	const { activeJobs: activeQuickJobs } = useQuickExpenseQueue();
	const allEmpty = activeJobs.length === 0 && activeQuickJobs.length === 0;

	if (allEmpty) {
		return <EmptyJobPlaceholder />;
	}

	return (
		<>
			{activeJobs.map((job) => (
				<ReceiptJobItem key={job.id} job={job} />
			))}
			{activeQuickJobs.map((job) => (
				<QuickExpenseJobItem key={job.id} job={job} />
			))}
		</>
	);
}
