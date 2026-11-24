import type { PendingMutation } from "@tanstack/db";

import { honoClient } from "#app/lib/api-client.ts";
import { readApiResponse } from "#app/lib/offline/errors.ts";

export const MUTATION_FNS = {
	expense: "saveExpense",
	income: "saveIncome",
	category: "saveCategory",
	wallet: "saveWallet",
	event: "saveEvent",
	recurringBill: "saveRecurringBill",
	setupRecurringBill: "setupRecurringBill",
} as const;

type MutationTransaction = { transaction: { mutations: Array<PendingMutation> } };

type Row = Record<string, unknown>;

function pick<T extends Row, K extends keyof T>(row: T, keys: Array<K>) {
	const result: Partial<T> = {};
	for (const key of keys) {
		if (row[key] !== undefined) result[key] = row[key];
	}
	return result;
}

/** Maps only the fields a PATCH actually changed, in the API's camelCase shape. */
function changedFields(mutation: PendingMutation, mapping: Record<string, string>): Row {
	const changes = (mutation.changes ?? {}) as Row;
	const payload: Row = {};
	for (const [column, field] of Object.entries(mapping)) {
		if (column in changes) payload[field] = changes[column] ?? null;
	}
	return payload;
}

function text(value: unknown): string {
	return typeof value === "string" ? value : "";
}

function textOrUndefined(value: unknown): string | undefined {
	return typeof value === "string" && value.length > 0 ? value : undefined;
}

function numberOrZero(value: unknown): number {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

const EXPENSE_FIELDS: Record<string, string> = {
	title: "title",
	description: "description",
	amount: "amount",
	currency: "currency",
	repeat: "repeat",
	date: "date",
	wallet_id: "walletId",
	category_id: "categoryId",
	recurring_bill_id: "recurringBillId",
	event_id: "eventId",
};

const INCOME_FIELDS: Record<string, string> = {
	title: "title",
	description: "description",
	amount: "amount",
	currency: "currency",
	repeat: "repeat",
	date: "date",
	wallet_id: "walletId",
	category_id: "categoryId",
};

const CATEGORY_FIELDS: Record<string, string> = {
	name: "name",
	description: "description",
	color: "color",
	type: "type",
};

const WALLET_FIELDS: Record<string, string> = {
	name: "name",
	description: "description",
	currency: "currency",
	type: "type",
	is_active: "isActive",
};

const EVENT_FIELDS: Record<string, string> = {
	title: "title",
	description: "description",
	start_date: "startDate",
	end_date: "endDate",
	budget: "budget",
	budget_currency: "currency",
	status: "status",
};

const RECURRING_BILL_FIELDS: Record<string, string> = {
	title: "title",
	description: "description",
	amount: "amount",
	currency: "currency",
	repeat: "repeat",
	anchor_date: "anchorDate",
	due_day: "dueDay",
	due_month: "dueMonth",
	wallet_id: "walletId",
	category_id: "categoryId",
	event_id: "eventId",
	is_active: "isActive",
};

function expenseBody(row: Row) {
	return {
		id: text(row.id),
		publicId: textOrUndefined(row.public_id),
		title: text(row.title),
		description: textOrUndefined(row.description),
		amount: numberOrZero(row.amount),
		currency: text(row.currency),
		repeat: text(row.repeat) || "one-time",
		date: textOrUndefined(row.date),
		walletId: text(row.wallet_id),
		categoryId: textOrUndefined(row.category_id),
		recurringBillId: textOrUndefined(row.recurring_bill_id),
		eventId: textOrUndefined(row.event_id),
	};
}

function incomeBody(row: Row) {
	return {
		id: text(row.id),
		publicId: textOrUndefined(row.public_id),
		title: text(row.title),
		description: textOrUndefined(row.description),
		amount: numberOrZero(row.amount),
		currency: text(row.currency),
		repeat: text(row.repeat) || "one-time",
		date: textOrUndefined(row.date),
		walletId: text(row.wallet_id),
		categoryId: textOrUndefined(row.category_id),
	};
}

function categoryBody(row: Row) {
	return {
		id: text(row.id),
		name: text(row.name),
		description: textOrUndefined(row.description),
		color: text(row.color) || "gray",
		type: text(row.type) || "expense",
	};
}

function walletBody(row: Row) {
	return {
		id: text(row.id),
		name: text(row.name),
		description: textOrUndefined(row.description),
		currency: text(row.currency),
		type: text(row.type),
		isActive: row.is_active !== false,
	};
}

function eventBody(row: Row) {
	return {
		id: text(row.id),
		publicId: textOrUndefined(row.public_id),
		title: text(row.title),
		description: textOrUndefined(row.description),
		startDate: textOrUndefined(row.start_date),
		endDate: textOrUndefined(row.end_date),
		budget: row.budget === null || row.budget === undefined ? undefined : numberOrZero(row.budget),
		currency: text(row.budget_currency),
		status: text(row.status) || "open",
	};
}

function recurringBillBody(row: Row) {
	return {
		id: text(row.id),
		publicId: textOrUndefined(row.public_id),
		title: text(row.title),
		description: textOrUndefined(row.description),
		amount: numberOrZero(row.amount),
		currency: text(row.currency),
		repeat: text(row.repeat) || "monthly",
		anchorDate: textOrUndefined(row.anchor_date),
		dueDay:
			row.due_day === null || row.due_day === undefined ? undefined : numberOrZero(row.due_day),
		dueMonth:
			row.due_month === null || row.due_month === undefined
				? undefined
				: numberOrZero(row.due_month),
		walletId: text(row.wallet_id),
		categoryId: textOrUndefined(row.category_id),
		eventId: textOrUndefined(row.event_id),
		workspaceId: text(row.workspace_id),
		isActive: row.is_active !== false,
	};
}

function buildPatch(
	mutation: PendingMutation,
	mapping: Record<string, string>,
	fallback: Row,
): Row {
	const mapped = changedFields(mutation, mapping);
	const payload: Row = {};
	for (const [field, value] of Object.entries(mapped)) {
		payload[field] = value;
	}
	// A create that was retried after a partial apply arrives as an update for a
	// row the server already has; send the full body so the row converges.
	if (!("walletId" in payload) && "wallet_id" in (mutation.modified as Row)) {
		payload.walletId = text((mutation.modified as Row).wallet_id);
	}
	return { ...fallback, ...payload };
}

async function persist(
	response: () => Promise<Response>,
	awaitTx: (txid: number) => Promise<unknown>,
) {
	const result = await readApiResponse<{ txid?: number }>(await response());
	if (typeof result?.txid === "number") {
		await awaitTx(result.txid);
	}
}

export function createMutationFns(
	slug: string,
	awaitTx: Record<string, (txid: number) => Promise<unknown>>,
) {
	const query = { workspaceIdOrSlug: slug };

	return {
		async [MUTATION_FNS.expense]({ transaction }: MutationTransaction) {
			for (const mutation of transaction.mutations) {
				const row = mutation.modified as Row;
				if (mutation.type === "insert") {
					await persist(
						() =>
							honoClient.bff.expenses.$post({
								query,
								json: expenseBody(row) as never,
							}),
						awaitTx.expense!,
					);
					continue;
				}
				if (mutation.type === "update") {
					await persist(
						() =>
							honoClient.bff.expenses[":id"].$patch({
								query,
								param: { id: text(row.id) },
								json: buildPatch(mutation, EXPENSE_FIELDS, {}) as never,
							}),
						awaitTx.expense!,
					);
					continue;
				}
				await persist(
					() =>
						honoClient.bff.expenses[":id"].$delete({
							query,
							param: { id: text((mutation.original as Row).id) },
						}),
					awaitTx.expense!,
				);
			}
		},

		async [MUTATION_FNS.income]({ transaction }: MutationTransaction) {
			for (const mutation of transaction.mutations) {
				const row = mutation.modified as Row;
				if (mutation.type === "insert") {
					await persist(
						() =>
							honoClient.bff.incomes.$post({
								query,
								json: incomeBody(row) as never,
							}),
						awaitTx.income!,
					);
					continue;
				}
				if (mutation.type === "update") {
					await persist(
						() =>
							honoClient.bff.incomes[":id"].$patch({
								query,
								param: { id: text(row.id) },
								json: buildPatch(mutation, INCOME_FIELDS, {}) as never,
							}),
						awaitTx.income!,
					);
					continue;
				}
				await persist(
					() =>
						honoClient.bff.incomes[":id"].$delete({
							query,
							param: { id: text((mutation.original as Row).id) },
						}),
					awaitTx.income!,
				);
			}
		},

		async [MUTATION_FNS.category]({ transaction }: MutationTransaction) {
			for (const mutation of transaction.mutations) {
				const row = mutation.modified as Row;
				if (mutation.type === "insert") {
					await persist(
						() =>
							honoClient.bff.categories.$post({
								query,
								json: categoryBody(row) as never,
							}),
						awaitTx.category!,
					);
					continue;
				}
				if (mutation.type === "update") {
					await persist(
						() =>
							honoClient.bff.categories[":id"].$patch({
								query,
								param: { id: text(row.id) },
								json: buildPatch(mutation, CATEGORY_FIELDS, {}) as never,
							}),
						awaitTx.category!,
					);
					continue;
				}
				await persist(
					() =>
						honoClient.bff.categories[":id"].$delete({
							query,
							param: { id: text((mutation.original as Row).id) },
						}),
					awaitTx.category!,
				);
			}
		},

		async [MUTATION_FNS.wallet]({ transaction }: MutationTransaction) {
			for (const mutation of transaction.mutations) {
				const row = mutation.modified as Row;
				if (mutation.type === "insert") {
					await persist(
						() =>
							honoClient.bff.wallets.$post({
								query,
								json: walletBody(row) as never,
							}),
						awaitTx.wallet!,
					);
					continue;
				}
				if (mutation.type === "update") {
					await persist(
						() =>
							honoClient.bff.wallets[":id"].$patch({
								query,
								param: { id: text(row.id) },
								json: buildPatch(mutation, WALLET_FIELDS, {}) as never,
							}),
						awaitTx.wallet!,
					);
					continue;
				}
				await persist(
					() =>
						honoClient.bff.wallets[":id"].$delete({
							query,
							param: { id: text((mutation.original as Row).id) },
						}),
					awaitTx.wallet!,
				);
			}
		},

		async [MUTATION_FNS.event]({ transaction }: MutationTransaction) {
			for (const mutation of transaction.mutations) {
				const row = mutation.modified as Row;
				if (mutation.type === "insert") {
					await persist(
						() =>
							honoClient.bff.events.$post({
								query,
								json: eventBody(row) as never,
							}),
						awaitTx.event!,
					);
					continue;
				}
				if (mutation.type === "update") {
					await persist(
						() =>
							honoClient.bff.events[":id"].$patch({
								query,
								param: { id: text(row.id) },
								json: buildPatch(mutation, EVENT_FIELDS, {}) as never,
							}),
						awaitTx.event!,
					);
					continue;
				}
				await persist(
					() =>
						honoClient.bff.events[":id"].$delete({
							query,
							param: { id: text((mutation.original as Row).id) },
						}),
					awaitTx.event!,
				);
			}
		},

		async [MUTATION_FNS.recurringBill]({ transaction }: MutationTransaction) {
			for (const mutation of transaction.mutations) {
				const row = mutation.modified as Row;
				if (mutation.type === "insert") {
					await persist(
						() =>
							honoClient.bff["recurring-bills"].$post({
								query,
								json: recurringBillBody(row) as never,
							}),
						awaitTx.recurringBill!,
					);
					continue;
				}
				if (mutation.type === "update") {
					await persist(
						() =>
							honoClient.bff["recurring-bills"][":id"].$patch({
								query,
								param: { id: text(row.id) },
								json: buildPatch(mutation, RECURRING_BILL_FIELDS, {}) as never,
							}),
						awaitTx.recurringBill!,
					);
					continue;
				}
				await persist(
					() =>
						honoClient.bff["recurring-bills"][":id"].$delete({
							query,
							param: { id: text((mutation.original as Row).id) },
						}),
					awaitTx.recurringBill!,
				);
			}
		},

		/** Bill create + expense link as one outbox entry; both are idempotent. */
		async [MUTATION_FNS.setupRecurringBill]({ transaction }: MutationTransaction) {
			const billMutation = transaction.mutations.find((mutation) =>
				String(mutation.collection.id).startsWith("recurring-bill"),
			);
			const expenseMutation = transaction.mutations.find((mutation) =>
				String(mutation.collection.id).startsWith("expense-"),
			);
			if (!billMutation) return;

			const billRow = billMutation.modified as Row;
			await persist(
				() =>
					honoClient.bff["recurring-bills"].$post({
						query,
						json: recurringBillBody(billRow) as never,
					}),
				awaitTx.recurringBill!,
			);

			if (!expenseMutation) return;
			const expenseRow = expenseMutation.modified as Row;
			await persist(
				() =>
					honoClient.bff.expenses[":id"].$patch({
						query,
						param: { id: text(expenseRow.id) },
						json: { recurringBillId: text(billRow.id) } as never,
					}),
				awaitTx.expense!,
			);
		},
	};
}
