import { IndexedDBAdapter, startOfflineExecutor } from "@tanstack/offline-transactions";

import {
	categoryCollectionFactory,
	eventCollectionFactory,
	expenseCollectionFactory,
	incomeCollectionFactory,
	recurringBillCollectionFactory,
	walletCollectionFactory,
} from "#app/lib/collections/index.ts";
import { createMutationFns } from "#app/lib/offline/mutation-fns.ts";

const executorBySlug = new Map<string, ReturnType<typeof startOfflineExecutor>>();

const AWAIT_TX_ID_TIMEOUT_MS = 10_000;

/**
 * Electric can lag behind a successful write — after a reconnect the shape may
 * not have caught up within the timeout. The write is already on the server at
 * this point, so a missed txid must not fail (and retry) the mutation.
 */
function txWaiter(collection: {
	utils: { awaitTxId: (txid: number, timeout?: number) => Promise<unknown> };
}) {
	return async (txid: number) => {
		try {
			await collection.utils.awaitTxId(txid, AWAIT_TX_ID_TIMEOUT_MS);
		} catch (error) {
			console.warn("[offline] txid not observed within the timeout; the write is already applied", {
				txid,
				error,
			});
		}
	};
}

function createExecutor(slug: string) {
	const expense = expenseCollectionFactory(slug);
	const income = incomeCollectionFactory(slug);
	const category = categoryCollectionFactory(slug);
	const wallet = walletCollectionFactory(slug);
	const event = eventCollectionFactory(slug);
	const recurringBill = recurringBillCollectionFactory(slug);

	const awaitTx = {
		expense: txWaiter(expense),
		income: txWaiter(income),
		category: txWaiter(category),
		wallet: txWaiter(wallet),
		event: txWaiter(event),
		recurringBill: txWaiter(recurringBill),
	};

	const executor = startOfflineExecutor({
		collections: {
			expense,
			income,
			category,
			wallet,
			event,
			recurringBill,
		},
		mutationFns: createMutationFns(slug, awaitTx),
		storage: new IndexedDBAdapter(`hoalu-offline-${slug}`),
		onStorageFailure: (diagnostic) => {
			console.warn("[offline] outbox storage unavailable:", diagnostic.message);
		},
		onUnknownMutationFn: (name) => {
			console.warn("[offline] dropping outbox entry for an unknown mutation:", name);
		},
	});

	void executor.waitForInit().catch((error: unknown) => {
		console.warn("[offline] executor failed to start:", error);
	});

	return executor;
}

export function getOfflineExecutor(slug: string) {
	const existing = executorBySlug.get(slug);
	if (existing) return existing;

	const executor = createExecutor(slug);
	executorBySlug.set(slug, executor);
	return executor;
}

export async function disposeOfflineExecutor(slug: string) {
	const executor = executorBySlug.get(slug);
	if (!executor) return;
	executorBySlug.delete(slug);
	executor.dispose();
}

export async function disposeAllOfflineExecutors() {
	const slugs = Array.from(executorBySlug.keys());
	await Promise.all(slugs.map((slug) => disposeOfflineExecutor(slug)));
}
