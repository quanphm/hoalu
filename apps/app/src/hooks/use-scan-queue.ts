import { MAX_QUEUE_SIZE } from "#app/helpers/constants.ts";
import { quickExpenseQueue, type QuickExpenseInput } from "#app/lib/queues/quick-expense-queue.ts";
import { receiptScanQueue, type ReceiptScanInput } from "#app/lib/queues/receipt-scan-queue.ts";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

export type { ReceiptScanInput } from "#app/lib/queues/receipt-scan-queue.ts";
export type { QuickExpenseInput } from "#app/lib/queues/quick-expense-queue.ts";

export function useScanQueue() {
	const queue = useAtomValue(receiptScanQueue.queueAtom);
	const pending = useAtomValue(receiptScanQueue.pendingAtom);
	const processing = useAtomValue(receiptScanQueue.processingAtom);
	const completed = useAtomValue(receiptScanQueue.completedAtom);
	const failed = useAtomValue(receiptScanQueue.failedAtom);

	// Receipt scan queue
	const addJob = useSetAtom(receiptScanQueue.add);
	const retryJob = useSetAtom(receiptScanQueue.retry);
	const dismissJob = useSetAtom(receiptScanQueue.dismiss);
	const removeJob = useSetAtom(receiptScanQueue.remove);
	const startEngine = useSetAtom(receiptScanQueue.startEngine);

	// Quick expense queue
	const quickQueue = useAtomValue(quickExpenseQueue.queueAtom);
	const addQuickJob = useSetAtom(quickExpenseQueue.add);
	const retryQuickJob = useSetAtom(quickExpenseQueue.retry);
	const dismissQuickJob = useSetAtom(quickExpenseQueue.dismiss);
	const removeQuickJob = useSetAtom(quickExpenseQueue.remove);
	const startQuickEngine = useSetAtom(quickExpenseQueue.startEngine);

	useEffect(() => {
		startEngine();
		startQuickEngine();
		return () => {
			receiptScanQueue.cleanup();
			quickExpenseQueue.cleanup();
		};
	}, [startEngine, startQuickEngine]);

	// Check if queue is full (excluding dismissed jobs)
	const isQueueFull = queue.filter((j) => j.status !== "dismissed").length >= MAX_QUEUE_SIZE;

	// Check if we can add more jobs
	const canAddMore = queue.filter((j) => j.status !== "dismissed").length < MAX_QUEUE_SIZE;

	// Get remaining slots
	const remainingSlots = MAX_QUEUE_SIZE - queue.filter((j) => j.status !== "dismissed").length;

	// Add a new receipt scan job
	const add = (input: ReceiptScanInput) => {
		if (!canAddMore) {
			throw new Error(`Queue is full. Maximum ${MAX_QUEUE_SIZE} receipts allowed.`);
		}
		addJob(input);
	};

	// Add a quick expense job
	const addQuickExpense = (input: QuickExpenseInput) => {
		addQuickJob(input);
	};

	// Retry a failed job
	const retry = (jobId: string) => {
		retryJob(jobId);
	};

	// Dismiss a failed job
	const dismiss = (jobId: string) => {
		dismissJob(jobId);
	};

	// Remove a job completely
	const remove = (jobId: string) => {
		removeJob(jobId);
	};

	// Quick expense actions
	const retryQuick = (jobId: string) => {
		retryQuickJob(jobId);
	};
	const dismissQuick = (jobId: string) => {
		dismissQuickJob(jobId);
	};
	const removeQuick = (jobId: string) => {
		removeQuickJob(jobId);
	};

	// Check if there are completed jobs waiting for review
	const hasCompletedJobs = completed.length > 0;

	// Get all non-dismissed jobs for display
	const activeJobs = queue.filter((job) => job.status !== "dismissed");

	// Get all non-dismissed quick expense jobs
	const activeQuickJobs = quickQueue.filter((job) => job.status !== "dismissed");

	return {
		// Job lists
		queue,
		activeJobs,
		pending,
		processing,
		completed,
		failed,

		// Quick expense jobs
		quickQueue,
		activeQuickJobs,

		// Status
		isQueueFull,
		canAddMore,
		remainingSlots,
		hasCompletedJobs,

		// Actions
		add,
		addQuickExpense,
		retry,
		dismiss,
		remove,

		// Quick expense actions
		retryQuick,
		dismissQuick,
		removeQuick,
	};
}
