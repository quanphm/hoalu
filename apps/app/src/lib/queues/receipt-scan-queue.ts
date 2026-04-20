import { MAX_QUEUE_SIZE } from "#app/helpers/constants.ts";
import type { ReceiptData } from "#app/hooks/use-receipt-scan.ts";
import { apiClient } from "#app/lib/api-client.ts";

import { createTaskQueue } from "./create-task-queue.ts";

export interface ConversationTurn {
	role: "user" | "assistant";
	content: string;
}

export interface ReceiptScanResult {
	data: ReceiptData | null;
	conversationHistory: ConversationTurn[];
}

export interface ReceiptScanInput {
	fileName: string;
	fileSize: number;
	fileType: string;
	previewBase64: string | null;
	encodedBase64: string;
	workspaceSlug: string;
	feedback?: string;
	conversationHistory?: ConversationTurn[];
}

export type ReceiptScanJob = {
	id: string;
	status: "pending" | "processing" | "completed" | "failed" | "dismissed";
	retryCount: number;
	input: ReceiptScanInput;
	result: ReceiptScanResult | null;
	errorMessage: string | null;
	createdAt: string;
	completedAt: string | null;
};

export const receiptScanQueue = createTaskQueue<ReceiptScanInput, ReceiptScanResult>({
	maxConcurrent: MAX_QUEUE_SIZE,
	maxRetries: 2,
	processor: {
		execute: async (input) => {
			if (input.feedback) {
				const result = await apiClient.files.refineReceipt(
					input.workspaceSlug,
					input.encodedBase64,
					input.feedback,
					input.conversationHistory,
				);
				if (!result.data) {
					throw new Error("Could not extract receipt data. The image may be unclear or not a valid receipt.");
				}
				return result as ReceiptScanResult;
			}
			const results = await apiClient.files.scanReceipt(input.workspaceSlug, [
				input.encodedBase64,
			]);
			const first = results[0] as ReceiptScanResult | undefined;
			if (!first?.data) {
				throw new Error("Could not extract receipt data. The image may be unclear or not a valid receipt.");
			}
			return first;
		},
	},
});
