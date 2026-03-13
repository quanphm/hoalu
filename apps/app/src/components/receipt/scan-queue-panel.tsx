import { scanQueueReviewDialogAtom } from "#app/atoms/dialogs.ts";
import { useScanQueue } from "#app/hooks/use-scan-queue.ts";
import type { ReceiptScanJob } from "#app/lib/queues/receipt-scan-queue.ts";
import {
	CheckCircleIcon,
	Loader2Icon,
	AlertCircleIcon,
	XIcon,
	RefreshCwIcon,
	EyeIcon,
	ReceiptIcon,
} from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { cn } from "@hoalu/ui/utils";
import { useSetAtom } from "jotai";

function JobStatusIcon({ status }: { status: ReceiptScanJob["status"] }) {
	switch (status) {
		case "pending":
			return <div className="bg-muted-foreground/20 size-4 rounded-full" />;
		case "processing":
			return <Loader2Icon className="text-primary size-4 animate-spin" />;
		case "completed":
			return <CheckCircleIcon className="size-4 text-green-500" />;
		case "failed":
			return <AlertCircleIcon className="text-destructive size-4" />;
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
			<div className="bg-muted flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-sm">
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

			{/* File info */}
			<div className="min-w-0 flex-1">
				<p className="truncate text-xs font-medium">{job.input.fileName}</p>
				<div className="flex items-center gap-1.5">
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
						{job.status === "pending" && "Waiting..."}
						{job.status === "processing" && "Scanning..."}
						{job.status === "completed" && "Ready to review"}
						{job.status === "failed" &&
							(job.retryCount > 0 ? `Failed (retry ${job.retryCount})` : "Failed")}
					</span>
				</div>
			</div>

			{/* Actions */}
			<div className="flex items-center gap-1">
				{job.status === "completed" && (
					<Button variant="ghost" size="icon" className="size-7" onClick={handleReview}>
						<EyeIcon className="size-3.5" />
					</Button>
				)}
				{job.status === "failed" && (
					<>
						<Button
							variant="ghost"
							size="icon"
							className="size-7"
							onClick={() => retry(job.id)}
							title="Retry"
						>
							<RefreshCwIcon className="size-3.5" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="text-destructive hover:text-destructive size-7"
							onClick={() => dismiss(job.id)}
							title="Dismiss"
						>
							<XIcon className="size-3.5" />
						</Button>
					</>
				)}
				{(job.status === "pending" || job.status === "dismissed") && (
					<Button
						variant="ghost"
						size="icon"
						className="size-7"
						onClick={() => remove(job.id)}
						title="Remove"
					>
						<XIcon className="size-3.5" />
					</Button>
				)}
			</div>
		</div>
	);
}

export function ScanQueuePanel() {
	const { activeJobs, hasCompletedJobs } = useScanQueue();

	return (
		<div className="space-y-3 px-3 py-2">
			{activeJobs.length > 0 && (
				<div className="space-y-2">
					{activeJobs.map((job) => (
						<JobItem key={job.id} job={job} />
					))}
				</div>
			)}

			{activeJobs.length === 0 && (
				<div className="py-4 text-center">
					<p className="text-muted-foreground text-xs">No jobs in queue</p>
					<p className="text-muted-foreground mt-1 text-[10px]">
						Click "Scan receipt" to add files
					</p>
				</div>
			)}

			{hasCompletedJobs && (
				<p className="text-muted-foreground text-[10px]">
					Click the eye icon to review scanned receipts and create expenses.
				</p>
			)}
		</div>
	);
}
