import { generateId } from "@hoalu/ids/generate-id";
import { observable, type Observable } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { useEffect, useMemo } from "react";

import { MAX_QUEUE_SIZE } from "#app/helpers/constants.ts";

import type { TaskJob, TaskQueueConfig } from "./types.ts";

export interface TaskQueueAtoms<TInput, TResult> {
	queue$: Observable<TaskJob<TInput, TResult>[]>;
	pending$: Observable<TaskJob<TInput, TResult>[]>;
	processing$: Observable<TaskJob<TInput, TResult>[]>;
	completed$: Observable<TaskJob<TInput, TResult>[]>;
	failed$: Observable<TaskJob<TInput, TResult>[]>;
}

export interface TaskQueueActions<TInput> {
	add: (input: TInput) => void;
	retry: (jobId: string) => void;
	dismiss: (jobId: string) => void;
	remove: (jobId: string) => void;
	startEngine: () => void;
}

export interface TaskQueueUtils {
	cleanup: () => void;
}

export interface UseTaskQueueResult<TInput, TResult> {
	queue: TaskJob<TInput, TResult>[];
	activeJobs: TaskJob<TInput, TResult>[];
	pending: TaskJob<TInput, TResult>[];
	processing: TaskJob<TInput, TResult>[];
	completed: TaskJob<TInput, TResult>[];
	failed: TaskJob<TInput, TResult>[];
	remainingSlots: number;
	add: (input: TInput) => void;
	retry: (jobId: string) => void;
	dismiss: (jobId: string) => void;
	remove: (jobId: string) => void;
}

export interface TaskQueue<TInput, TResult>
	extends TaskQueueAtoms<TInput, TResult>, TaskQueueActions<TInput>, TaskQueueUtils {
	useQueue: () => UseTaskQueueResult<TInput, TResult>;
}

export function createTaskQueue<TInput, TResult>(
	config: TaskQueueConfig<TInput, TResult>,
): TaskQueue<TInput, TResult> {
	let isEngineRunning = false;
	let { maxConcurrent = 1, maxRetries = 2 } = config;

	if (maxConcurrent > MAX_QUEUE_SIZE) {
		maxConcurrent = MAX_QUEUE_SIZE;
	}

	const baseQueue$ = observable<TaskJob<TInput, TResult>[]>([]);
	const queue$ = observable(() => baseQueue$.get());
	const pending$ = observable(() => baseQueue$.get().filter((job) => job.status === "pending"));
	const processing$ = observable(() =>
		baseQueue$.get().filter((job) => job.status === "processing"),
	);
	const completed$ = observable(() => baseQueue$.get().filter((job) => job.status === "completed"));
	const failed$ = observable(() => baseQueue$.get().filter((job) => job.status === "failed"));

	async function processJob(jobId: string) {
		const jobs = baseQueue$.peek();
		const job = jobs.find((j) => j.id === jobId);
		if (!job || job.status !== "pending") return;

		// Mark as processing
		baseQueue$.set(jobs.map((j) => (j.id === jobId ? { ...j, status: "processing" as const } : j)));

		try {
			const result = await config.processor.execute(job.input);

			const currentJobs = baseQueue$.peek();
			baseQueue$.set(
				currentJobs.map((j) =>
					j.id === jobId
						? {
								...j,
								status: "completed" as const,
								result,
								completedAt: new Date().toISOString(),
							}
						: j,
				),
			);
		} catch (error) {
			console.error("[TaskQueue] Job processing error:", error);
			const errorMessage = error instanceof Error ? error.message : "Unknown error";
			const currentJobs = baseQueue$.peek();
			const currentJob = currentJobs.find((j) => j.id === jobId);

			const shouldRetry = (currentJob?.retryCount ?? 0) < maxRetries;

			if (shouldRetry) {
				baseQueue$.set(
					currentJobs.map((j) =>
						j.id === jobId
							? {
									...j,
									status: "pending" as const,
									retryCount: (j.retryCount ?? 0) + 1,
									errorMessage,
								}
							: j,
					),
				);
			} else {
				baseQueue$.set(
					currentJobs.map((j) =>
						j.id === jobId
							? {
									...j,
									status: "failed" as const,
									errorMessage,
								}
							: j,
					),
				);
			}
		}
	}

	function add(input: TInput) {
		const newJob: TaskJob<TInput, TResult> = {
			id: generateId({ use: "uuid" }),
			status: "pending",
			retryCount: 0,
			input,
			result: null,
			errorMessage: null,
			createdAt: new Date().toISOString(),
			completedAt: null,
		};

		const currentJobs = baseQueue$.peek();
		baseQueue$.set([...currentJobs, newJob]);

		if (isEngineRunning) {
			const processingCount = currentJobs.filter((j) => j.status === "processing").length;
			if (processingCount < maxConcurrent) {
				// Use setTimeout to avoid synchronous re-entry issues
				setTimeout(() => {
					const processNext = async () => {
						try {
							const jobs = baseQueue$.peek();
							const currentProcessingCount = jobs.filter((j) => j.status === "processing").length;
							if (currentProcessingCount >= maxConcurrent) {
								return;
							}

							const nextPending = jobs.find((j) => j.status === "pending");
							if (!nextPending) return;

							await processJob(nextPending.id);

							// Continue processing
							const updatedJobs = baseQueue$.peek();

							const hasMorePending = updatedJobs.some((j) => j.status === "pending");
							if (hasMorePending) {
								processNext();
							}
						} catch (err) {
							console.error("[TaskQueue] processNext error:", err);
						}
					};
					processNext();
				}, 0);
			}
		}
	}

	function retry(jobId: string) {
		const currentJobs = baseQueue$.peek();
		baseQueue$.set(
			currentJobs.map((j) =>
				j.id === jobId
					? {
							...j,
							status: "pending" as const,
							retryCount: 0, // Reset retry count for manual retry
							errorMessage: null,
						}
					: j,
			),
		);
		// Trigger engine to process the retried job
		if (isEngineRunning) {
			const processNext = async () => {
				const jobs = baseQueue$.peek();
				const processingCount = jobs.filter((j) => j.status === "processing").length;
				if (processingCount >= maxConcurrent) return;
				const nextPending = jobs.find((j) => j.status === "pending");
				if (!nextPending) return;
				await processJob(nextPending.id);
				// Continue processing
				const updatedJobs = baseQueue$.peek();
				const hasMorePending = updatedJobs.some((j) => j.status === "pending");
				if (hasMorePending) {
					processNext();
				}
			};
			processNext();
		}
	}

	function dismiss(jobId: string) {
		const currentJobs = baseQueue$.peek();
		baseQueue$.set(
			currentJobs.map((j) => (j.id === jobId ? { ...j, status: "dismissed" as const } : j)),
		);
	}

	function remove(jobId: string) {
		const currentJobs = baseQueue$.peek();
		baseQueue$.set(currentJobs.filter((j) => j.id !== jobId));
	}

	function startEngine() {
		if (isEngineRunning) {
			return;
		}
		isEngineRunning = true;

		const processNext = async () => {
			const jobs = baseQueue$.peek();
			const processingCount = jobs.filter((j) => j.status === "processing").length;

			if (processingCount >= maxConcurrent) {
				return;
			}

			const nextPending = jobs.find((j) => j.status === "pending");
			if (!nextPending) {
				return;
			}

			await processJob(nextPending.id);

			const updatedJobs = baseQueue$.peek();
			const hasMorePending = updatedJobs.some((j) => j.status === "pending");
			if (hasMorePending) {
				processNext();
			}
		};
		processNext();
	}

	function cleanup() {
		isEngineRunning = false;
	}

	function useQueue(): UseTaskQueueResult<TInput, TResult> {
		const queue = useValue(queue$);
		const pending = useValue(pending$);
		const processing = useValue(processing$);
		const completed = useValue(completed$);
		const failed = useValue(failed$);

		useEffect(() => {
			startEngine();
			return () => {
				cleanup();
			};
		}, []);

		const activeJobs = useMemo(() => queue.filter((job) => job.status !== "dismissed"), [queue]);

		const remainingSlots = useMemo(
			() => Math.max(0, MAX_QUEUE_SIZE - activeJobs.length),
			[activeJobs],
		);

		return {
			queue,
			activeJobs,
			pending,
			processing,
			completed,
			failed,
			remainingSlots,
			add,
			retry,
			dismiss,
			remove,
		};
	}

	return {
		queue$,
		pending$,
		processing$,
		completed$,
		failed$,
		add,
		retry,
		dismiss,
		remove,
		startEngine,
		cleanup,
		useQueue,
	};
}
