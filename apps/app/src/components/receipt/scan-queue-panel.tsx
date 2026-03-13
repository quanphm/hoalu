import { scanQueueReviewDialogAtom } from "#app/atoms/dialogs.ts";
import { useScanQueue } from "#app/hooks/use-scan-queue.ts";
import type { ReceiptScanJob } from "#app/lib/queues/receipt-scan-queue.ts";
import {
	Loader2Icon,
	AlertCircleIcon,
	RefreshCwIcon,
	EyeIcon,
	ReceiptIcon,
} from "@hoalu/icons/lucide";
import { XIcon, CheckIcon } from "@hoalu/icons/tabler";
import { Button } from "@hoalu/ui/button";
import { cn } from "@hoalu/ui/utils";
import { useSetAtom } from "jotai";

function JobStatusIcon({ status }: { status: ReceiptScanJob["status"] }) {
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

function JobItem({ job }: { job: ReceiptScanJob }) {
	const { retry, dismiss, remove } = useScanQueue();
	const setReviewDialog = useSetAtom(scanQueueReviewDialogAtom);

	const handleReview = () => {
		setReviewDialog({ state: true, data: { jobId: job.id } });
	};

	return (
		<div className="bg-card flex items-center gap-2 rounded-md border p-2">
			{/* Preview thumbnail */}
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
					<span
						className={cn(
							"text-[10px]",
							job.status === "failed" && "text-destructive",
							job.status === "completed" && "text-green-600",
							job.status === "processing" && "text-primary",
							job.status === "pending" && "text-muted-foreground",
						)}
					>
						{job.status === "pending" && "Waiting"}
						{job.status === "processing" && "Scanning"}
						{job.status === "completed" && "Ready"}
						{job.status === "failed" &&
							(job.retryCount > 0 ? `Failed (retry ${job.retryCount})` : "Failed")}
					</span>
				</div>
			</div>

			{/* Actions */}
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
	return (
		<div className="bg-muted/30 flex items-center gap-2 rounded-md border border-dashed p-2">
			<div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-sm">
				<ReceiptIcon className="text-muted-foreground/40 size-4" />
			</div>
			<div className="min-w-0 flex-1">
				<p className="text-muted-foreground/60 truncate text-xs font-medium">No items</p>
				<div className="flex items-center gap-1">
					<div className="bg-muted-foreground/20 size-3 rounded-full" />
					<span className="text-muted-foreground/60 text-[10px]">Add files to scan</span>
				</div>
			</div>
		</div>
	);
}

export function ScanQueuePanel() {
	const { activeJobs } = useScanQueue();
	if (activeJobs.length === 0) {
		return <EmptyJobPlaceholder />;
	}
	return activeJobs.map((job) => <JobItem key={job.id} job={job} />);
}
