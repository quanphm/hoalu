import { MAX_QUEUE_SIZE } from "#app/helpers/constants.ts";
import { quickExpenseQueue } from "#app/lib/queues/quick-expense-queue.ts";
import { receiptScanQueue } from "#app/lib/queues/receipt-scan-queue.ts";

export type { ReceiptScanInput } from "#app/lib/queues/receipt-scan-queue.ts";
export type { QuickExpenseInput } from "#app/lib/queues/quick-expense-queue.ts";

/**
 * Hook for receipt scan queue operations.
 * Use this when you need to add/manage receipt scan jobs.
 */
export const useReceiptScanQueue = receiptScanQueue.useQueue;

/**
 * Hook for quick expense queue operations.
 * Use this when you need to add/manage quick expense parse jobs.
 */
export const useQuickExpenseQueue = quickExpenseQueue.useQueue;

export function useQueueStatus() {
	const receiptQueue = useReceiptScanQueue();
	const quickQueue = useQuickExpenseQueue();

	const totalActiveJobs = receiptQueue.activeJobs.length + quickQueue.activeJobs.length;
	const sharedRemainingSlots = Math.max(0, MAX_QUEUE_SIZE - totalActiveJobs);
	const isFull = sharedRemainingSlots === 0;

	return {
		totalActiveJobs,
		sharedRemainingSlots,
		isFull,
		maxQueueSize: MAX_QUEUE_SIZE,
	};
}
