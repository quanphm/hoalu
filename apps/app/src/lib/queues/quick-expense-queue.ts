import { MAX_QUEUE_SIZE } from "#app/helpers/constants.ts";
import { apiClient } from "#app/lib/api-client.ts";

import { createTaskQueue } from "./create-task-queue.ts";

export interface QuickExpenseResult {
	title: string;
	amount: number;
	currency: string;
	date: string;
	suggestedCategoryId: string | null;
	suggestedWalletId: string | null;
	repeat: "one-time" | "daily" | "weekly" | "monthly" | "yearly";
	confidence: number;
}

export interface QuickExpenseInput {
	text: string;
	workspaceSlug: string;
}

export type QuickExpenseJob = {
	id: string;
	status: "pending" | "processing" | "completed" | "failed" | "dismissed";
	retryCount: number;
	input: QuickExpenseInput;
	result: QuickExpenseResult | null;
	errorMessage: string | null;
	createdAt: string;
	completedAt: string | null;
};

export const quickExpenseQueue = createTaskQueue<QuickExpenseInput, QuickExpenseResult>({
	maxConcurrent: MAX_QUEUE_SIZE,
	maxRetries: 1,
	processor: {
		execute: async (input) => {
			const result = await apiClient.expenses.parseQuickEntry(input.workspaceSlug, input.text);
			return result as QuickExpenseResult;
		},
	},
});
