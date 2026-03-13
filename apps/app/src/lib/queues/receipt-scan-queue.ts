import type { ReceiptData } from "#app/hooks/use-receipt-scan.ts";
import { apiClient } from "#app/lib/api-client.ts";

import { createTaskQueue } from "./create-task-queue.ts";

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
		execute: async (input) => {
			const results = await apiClient.files.scanReceipt(input.workspaceSlug, [
				input.encodedBase64,
			]);
			return (results[0] as ReceiptData | null) ?? null;
		},
	},
});
