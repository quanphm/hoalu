import type { ReceiptData } from "#app/hooks/use-receipt-scan.ts";

import ReceiptScanWorker from "../../workers/receipt-scan?worker";
import { createTaskQueue } from "./create-task-queue.ts";

const worker = new ReceiptScanWorker();

export interface ReceiptScanInput {
	fileName: string;
	fileSize: number;
	fileType: string;
	previewBase64: string | null;
	encodedBase64: string;
	workspaceSlug: string;
}

export type ReceiptScanJob = {
	id: string;
	status: "pending" | "processing" | "completed" | "failed" | "dismissed";
	retryCount: number;
	input: ReceiptScanInput;
	result: ReceiptData | null;
	errorMessage: string | null;
	createdAt: string;
	completedAt: string | null;
};

export const receiptScanQueue = createTaskQueue<ReceiptScanInput, ReceiptData | null>({
	maxConcurrent: 1,
	maxRetries: 2,
	processor: {
		type: "worker",
		worker,
	},
});
