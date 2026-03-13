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

export interface MainProcessorConfig<TInput, TResult> {
	type: "main";
	execute: (input: TInput) => Promise<TResult>;
}

export interface WorkerProcessorConfig {
	type: "worker";
	worker: Worker;
}

export type TaskProcessorConfig<TInput, TResult> =
	| MainProcessorConfig<TInput, TResult>
	| WorkerProcessorConfig;

export interface TaskQueueConfig<TInput, TResult> {
	maxConcurrent?: number;
	maxRetries?: number;
	processor: TaskProcessorConfig<TInput, TResult>;
}

// Worker message types
export interface WorkerRequest<TInput> {
	jobId: string;
	input: TInput;
}

export interface WorkerSuccessResponse<TResult> {
	jobId: string;
	result: TResult;
}

export interface WorkerErrorResponse {
	jobId: string;
	error: string;
}

export type WorkerResponse<TResult> = WorkerSuccessResponse<TResult> | WorkerErrorResponse;
