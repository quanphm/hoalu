export interface TaskJob<TInput, TResult> {
	id: string;
	status: "pending" | "processing" | "completed" | "failed" | "dismissed";
	retryCount: number;
	input: TInput;
	result: TResult | null;
	errorMessage: string | null;
	createdAt: string;
	completedAt: string | null;
}

export interface TaskProcessorConfig<TInput, TResult> {
	execute: (input: TInput) => Promise<TResult>;
}

export interface TaskQueueConfig<TInput, TResult> {
	maxConcurrent?: number;
	maxRetries?: number;
	processor: TaskProcessorConfig<TInput, TResult>;
}
