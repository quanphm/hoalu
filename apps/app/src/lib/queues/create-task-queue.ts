import { MAX_QUEUE_SIZE } from "#app/helpers/constants.ts";
import { generateId } from "@hoalu/common/generate-id";
import { atom, type Atom, useAtomValue, useSetAtom, type WritableAtom } from "jotai";
import { useEffect, useMemo } from "react";

import type { TaskJob, TaskQueueConfig } from "./types.ts";

interface TaskQueueAtoms<TInput, TResult> {
	queueAtom: Atom<TaskJob<TInput, TResult>[]>;
	pendingAtom: Atom<TaskJob<TInput, TResult>[]>;
	processingAtom: Atom<TaskJob<TInput, TResult>[]>;
	completedAtom: Atom<TaskJob<TInput, TResult>[]>;
	failedAtom: Atom<TaskJob<TInput, TResult>[]>;
}

interface TaskQueueActions<TInput> {
	add: WritableAtom<null, [TInput], void>;
	retry: WritableAtom<null, [string], void>;
	dismiss: WritableAtom<null, [string], void>;
	remove: WritableAtom<null, [string], void>;
	startEngine: WritableAtom<null, [], void>;
}

interface TaskQueueUtils {
	cleanup: () => void;
}

interface UseTaskQueueResult<TInput, TResult> {
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

interface TaskQueue<TInput, TResult>
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

	const baseQueueAtom = atom<TaskJob<TInput, TResult>[]>([]);
	const queueAtom = atom((get) => get(baseQueueAtom));
	const pendingAtom = atom((get) => get(baseQueueAtom).filter((job) => job.status === "pending"));

	const processingAtom = atom((get) =>
		get(baseQueueAtom).filter((job) => job.status === "processing"),
	);
	const completedAtom = atom((get) =>
		get(baseQueueAtom).filter((job) => job.status === "completed"),
	);
	const failedAtom = atom((get) => get(baseQueueAtom).filter((job) => job.status === "failed"));

	async function processJob(
		set: (atom: typeof baseQueueAtom, value: TaskJob<TInput, TResult>[]) => void,
		get: <T>(atom: Atom<T>) => T,
		jobId: string,
	) {
		const jobs = get(baseQueueAtom);
		const job = jobs.find((j) => j.id === jobId);
		if (!job || job.status !== "pending") return;

		// Mark as processing
		set(
			baseQueueAtom,
			jobs.map((j) => (j.id === jobId ? { ...j, status: "processing" as const } : j)),
		);

		try {
			const result = await config.processor.execute(job.input);

			const currentJobs = get(baseQueueAtom);
			set(
				baseQueueAtom,
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
			const currentJobs = get(baseQueueAtom);
			const currentJob = currentJobs.find((j) => j.id === jobId);

			const shouldRetry = (currentJob?.retryCount ?? 0) < maxRetries;

			if (shouldRetry) {
				set(
					baseQueueAtom,
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
				set(
					baseQueueAtom,
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

	const add = atom(null, (get, set, input: TInput) => {
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

		const currentJobs = get(baseQueueAtom);
		set(baseQueueAtom, [...currentJobs, newJob]);

		if (isEngineRunning) {
			const processingCount = currentJobs.filter((j) => j.status === "processing").length;
			if (processingCount < maxConcurrent) {
				// Use setTimeout to avoid synchronous re-entry issues
				setTimeout(() => {
					const processNext = async () => {
						try {
							const jobs = get(baseQueueAtom);
							const currentProcessingCount = jobs.filter((j) => j.status === "processing").length;
							if (currentProcessingCount >= maxConcurrent) {
								return;
							}

							const nextPending = jobs.find((j) => j.status === "pending");
							if (!nextPending) return;

							await processJob(set, get, nextPending.id);

							// Continue processing
							const updatedJobs = get(baseQueueAtom);

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
	});

	const retry = atom(null, (get, set, jobId: string) => {
		const currentJobs = get(baseQueueAtom);
		set(
			baseQueueAtom,
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
				const jobs = get(baseQueueAtom);
				const processingCount = jobs.filter((j) => j.status === "processing").length;
				if (processingCount >= maxConcurrent) return;
				const nextPending = jobs.find((j) => j.status === "pending");
				if (!nextPending) return;
				await processJob(set, get, nextPending.id);
				// Continue processing
				const updatedJobs = get(baseQueueAtom);
				const hasMorePending = updatedJobs.some((j) => j.status === "pending");
				if (hasMorePending) {
					processNext();
				}
			};
			processNext();
		}
	});

	const dismiss = atom(null, (get, set, jobId: string) => {
		const currentJobs = get(baseQueueAtom);
		set(
			baseQueueAtom,
			currentJobs.map((j) => (j.id === jobId ? { ...j, status: "dismissed" as const } : j)),
		);
	});

	const remove = atom(null, (get, set, jobId: string) => {
		const currentJobs = get(baseQueueAtom);
		set(
			baseQueueAtom,
			currentJobs.filter((j) => j.id !== jobId),
		);
	});

	const startEngine = atom(null, (get, set) => {
		if (isEngineRunning) {
			return;
		}
		isEngineRunning = true;

		const processNext = async () => {
			const jobs = get(baseQueueAtom);
			const processingCount = jobs.filter((j) => j.status === "processing").length;

			if (processingCount >= maxConcurrent) {
				return;
			}

			const nextPending = jobs.find((j) => j.status === "pending");
			if (!nextPending) {
				return;
			}

			await processJob(set, get, nextPending.id);

			const updatedJobs = get(baseQueueAtom);
			const hasMorePending = updatedJobs.some((j) => j.status === "pending");
			if (hasMorePending) {
				processNext();
			}
		};
		processNext();
	});

	function cleanup() {
		isEngineRunning = false;
	}

	function useQueue(): UseTaskQueueResult<TInput, TResult> {
		const queue = useAtomValue(queueAtom);
		const pending = useAtomValue(pendingAtom);
		const processing = useAtomValue(processingAtom);
		const completed = useAtomValue(completedAtom);
		const failed = useAtomValue(failedAtom);

		const addFn = useSetAtom(add);
		const retryFn = useSetAtom(retry);
		const dismissFn = useSetAtom(dismiss);
		const removeFn = useSetAtom(remove);
		const startFn = useSetAtom(startEngine);

		useEffect(() => {
			startFn();
			return () => {
				cleanup();
			};
		}, [startFn]);

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
			add: addFn,
			retry: retryFn,
			dismiss: dismissFn,
			remove: removeFn,
		};
	}

	return {
		queueAtom,
		pendingAtom,
		processingAtom,
		completedAtom,
		failedAtom,
		add,
		retry,
		dismiss,
		remove,
		startEngine,
		cleanup,
		useQueue,
	};
}
