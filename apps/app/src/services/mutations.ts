import { generateId } from "@hoalu/ids/generate-id";
import { toastManager } from "@hoalu/ui/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { WebHaptics } from "web-haptics";

import { draftIncome$ } from "#app/atoms/incomes.ts";
import { draftExpense$ } from "#app/atoms/index.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { apiClient } from "#app/lib/api-client.ts";
import { authClient } from "#app/lib/auth-client.ts";
import {
	categoryCollectionFactory,
	eventCollectionFactory,
	expenseCollectionFactory,
	incomeCollectionFactory,
	recurringBillCollectionFactory,
	walletCollectionFactory,
} from "#app/lib/collections/index.ts";
import { MUTATION_FNS } from "#app/lib/offline/mutation-fns.ts";
import { useCurrentUserId, useLocalMutation } from "#app/lib/offline/use-local-mutation.ts";
import {
	categoryKeys,
	eventKeys,
	expenseKeys,
	fileKeys,
	incomeKeys,
	recurringBillKeys,
	walletKeys,
	workspaceKeys,
} from "#app/lib/query-key-factory.ts";
import { playConfirmSound, playDropSound } from "#app/lib/sound-effects.ts";

import type { SyncedExpense } from "#app/components/expenses/use-expenses.ts";
import type { SyncedIncome } from "#app/components/incomes/use-incomes.ts";
import type {
	CategoryPatchSchema,
	CategoryPostSchema,
	EventPatchSchema,
	EventPostSchema,
	ExpensePatchSchema,
	ExpensePostSchema,
	IncomePatchSchema,
	IncomePostSchema,
	WalletPatchSchema,
	WalletPostSchema,
	WorkspaceFormSchema,
	WorkspaceMetadataFormSchema,
} from "#app/lib/schema.ts";

const haptics = new WebHaptics();

const routeApi = getRouteApi("/_dashboard/$slug");

const REPEAT_VALUES = ["one-time", "daily", "weekly", "monthly", "yearly", "custom"] as const;

type RepeatValue = (typeof REPEAT_VALUES)[number];

function toRepeat(value: unknown, fallback: RepeatValue = "one-time"): RepeatValue {
	return REPEAT_VALUES.includes(value as RepeatValue) ? (value as RepeatValue) : fallback;
}

/**
 * workspaces
 */

export function useCreateWorkspace() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const mutation = useMutation({
		mutationFn: async ({ payload }: { payload: WorkspaceFormSchema }) => {
			const { data, error } = await authClient.workspace.create({
				name: payload.name,
				slug: payload.slug,
				metadata: {
					currency: payload.currency,
				},
			});
			if (error) {
				throw error;
			}
			return data;
		},
		onSuccess: (data) => {
			void haptics.trigger("success");
			toastManager.add({
				title: "Workspace created.",
				type: "success",
			});
			void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
			navigate({
				to: "/$slug",
				params: {
					slug: data.slug,
				},
			});
		},
		onError: (error) => {
			void haptics.trigger("error");
			toastManager.add({
				title: "Uh oh! Something went wrong.",
				description: error.message,
				type: "error",
			});
		},
	});
	return mutation;
}

export function useEditWorkspace() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		mutationFn: async ({ payload }: { payload: Omit<WorkspaceFormSchema, "currency"> }) => {
			const { data, error } = await authClient.workspace.update({
				data: {
					name: payload.name,
					slug: payload.slug === slug ? undefined : payload.slug,
					logo: payload.logo || undefined,
				},
				idOrSlug: slug,
			});
			if (error) {
				throw error;
			}
			return data;
		},
		onSuccess: (data) => {
			void haptics.trigger("success");
			toastManager.add({
				title: "Workspace updated.",
				type: "success",
			});
			if (slug !== data.slug) {
				queryClient.removeQueries({ queryKey: workspaceKeys.withSlug(slug) });
				void navigate({
					to: "/$slug/settings/workspace",
					params: {
						slug: data.slug,
					},
				});
			} else {
				void queryClient.invalidateQueries({ queryKey: workspaceKeys.withSlug(slug) });
			}
		},
	});
	return mutation;
}

export function useEditWorkspaceMetadata() {
	const queryClient = useQueryClient();
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		mutationFn: async ({ payload }: { payload: WorkspaceMetadataFormSchema }) => {
			const { data, error } = await authClient.workspace.update({
				data: {
					metadata: payload,
				},
				idOrSlug: slug,
			});
			if (error) {
				throw error;
			}
			return data;
		},
		onSuccess: () => {
			void haptics.trigger("success");
			toastManager.add({
				title: "Workspace updated.",
				type: "success",
			});
			void queryClient.invalidateQueries({ queryKey: workspaceKeys.withSlug(slug) });
		},
	});
	return mutation;
}

export function useDeleteWorkspace() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const mutation = useMutation({
		mutationFn: async ({ confirm }: { confirm: string }) => {
			const { data, error } = await authClient.workspace.delete({ idOrSlug: confirm });
			if (error) {
				throw error;
			}
			return data;
		},
		onSuccess: async (data) => {
			void haptics.trigger("warning");
			toastManager.add({
				title: "Workspace deleted.",
				type: "success",
			});
			queryClient.removeQueries({ queryKey: workspaceKeys.withSlug(data.slug) });
			void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
			void navigate({ to: "/" });
		},
		onError: (error) => {
			void haptics.trigger("error");
			toastManager.add({
				title: "Uh oh! Something went wrong.",
				description: error.message,
				type: "error",
			});
		},
	});
	return mutation;
}

export function useRemoveMember() {
	const queryClient = useQueryClient();
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		mutationFn: async ({ id }: { id: string }) => {
			const { data, error } = await authClient.workspace.removeMember({
				userId: id,
				idOrSlug: slug,
			});
			if (error) {
				throw error;
			}
			return data;
		},
		onSuccess: async () => {
			void haptics.trigger("warning");
			playDropSound();
			queryClient.removeQueries({ queryKey: workspaceKeys.all });
			void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
		},
		onError: (error) => {
			void haptics.trigger("error");
			toastManager.add({
				title: "Uh oh! Something went wrong.",
				description: error.message,
				type: "error",
			});
		},
	});
	return mutation;
}

export function useCancelInvitation() {
	const queryClient = useQueryClient();
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		mutationFn: async ({ id }: { id: string }) => {
			const { data, error } = await authClient.workspace.cancelInvitation({ invitationId: id });
			if (error) {
				throw error;
			}
			return data;
		},
		onSuccess: () => {
			void haptics.trigger("warning");
			playDropSound();
			void queryClient.invalidateQueries({ queryKey: workspaceKeys.withSlug(slug) });
		},
		onError: (error) => {
			void haptics.trigger("error");
			toastManager.add({
				title: "Uh oh! Something went wrong.",
				description: error.message,
				type: "error",
			});
		},
	});
	return mutation;
}

/**
 * expenses
 */

export function useCreateExpense() {
	const { slug } = routeApi.useParams();
	const collection = expenseCollectionFactory(slug);
	const creatorId = useCurrentUserId();

	return useLocalMutation<
		{ payload: ExpensePostSchema },
		{ payload: ExpensePostSchema; id: string; publicId: string }
	>({
		mutationFnName: MUTATION_FNS.expense,
		prepare: ({ payload }) => ({
			payload,
			id: generateId({ use: "uuid" }),
			publicId: generateId({ use: "nanoid", kind: "expense" }),
		}),
		onMutate: ({ payload, id, publicId }) => {
			collection.insert({
				id,
				public_id: publicId,
				title: payload.title,
				description: payload.description ?? null,
				amount: payload.amount,
				currency: payload.currency,
				repeat: payload.repeat ?? "one-time",
				date: payload.date ?? new Date().toISOString(),
				wallet_id: payload.walletId,
				category_id: payload.categoryId ?? null,
				recurring_bill_id: payload.recurringBillId ?? null,
				event_id: payload.eventId ?? null,
				creator_id: creatorId,
				created_at: new Date().toISOString(),
			});
		},
		success: { title: "Expense created.", sound: playConfirmSound },
	});
}

export function useEditExpense() {
	const { slug } = routeApi.useParams();
	const collection = expenseCollectionFactory(slug);

	return useLocalMutation<
		{ id: string; payload: ExpensePatchSchema },
		{ id: string; payload: ExpensePatchSchema }
	>({
		mutationFnName: MUTATION_FNS.expense,
		prepare: ({ id, payload }) => ({ id, payload }),
		onMutate: ({ id, payload }) => {
			collection.update(id, (draft) => {
				if (payload.title !== undefined) draft.title = payload.title;
				if (payload.description !== undefined) draft.description = payload.description;
				if (payload.amount !== undefined) draft.amount = payload.amount;
				if (payload.currency !== undefined) draft.currency = payload.currency;
				if (payload.repeat !== undefined) draft.repeat = payload.repeat;
				if (payload.date !== undefined) draft.date = payload.date;
				if (payload.walletId !== undefined) draft.wallet_id = payload.walletId;
				if (payload.categoryId !== undefined) draft.category_id = payload.categoryId;
				if (payload.recurringBillId !== undefined)
					draft.recurring_bill_id = payload.recurringBillId;
				if (payload.eventId !== undefined) draft.event_id = payload.eventId;
			});
		},
		success: { title: "Expense updated.", sound: playConfirmSound },
	});
}

export function useDeleteExpense() {
	const { slug } = routeApi.useParams();
	const collection = expenseCollectionFactory(slug);

	return useLocalMutation<{ id: string }, { id: string }>({
		mutationFnName: MUTATION_FNS.expense,
		prepare: ({ id }) => ({ id }),
		onMutate: ({ id }) => {
			collection.delete(id);
		},
		success: { title: "Expense deleted.", haptic: "warning", sound: playDropSound },
	});
}

export function useParseQuickExpense() {
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		networkMode: "always",
		mutationFn: async ({ text }: { text: string }) => {
			const result = await apiClient.expenses.parseQuickEntry(slug, text);
			return result;
		},
		onError: (error) => {
			void haptics.trigger("error");
			toastManager.add({
				title: "Couldn't parse expense",
				description: error.message,
				type: "error",
			});
		},
	});
	return mutation;
}

/**
 * incomes
 */

export function useCreateIncome() {
	const { slug } = routeApi.useParams();
	const collection = incomeCollectionFactory(slug);

	return useLocalMutation<
		{ payload: IncomePostSchema },
		{ payload: IncomePostSchema; id: string; publicId: string }
	>({
		mutationFnName: MUTATION_FNS.income,
		prepare: ({ payload }) => ({
			payload,
			id: generateId({ use: "uuid" }),
			publicId: generateId({ use: "nanoid", kind: "income" }),
		}),
		onMutate: ({ payload, id, publicId }) => {
			const timestamp = new Date().toISOString();
			collection.insert({
				id,
				public_id: publicId,
				title: payload.title,
				description: payload.description ?? null,
				amount: payload.amount,
				currency: payload.currency,
				repeat: payload.repeat ?? "one-time",
				date: payload.date ?? timestamp,
				wallet_id: payload.walletId,
				category_id: payload.categoryId ?? null,
				created_at: timestamp,
				updated_at: timestamp,
			});
		},
		success: { title: "Income created.", sound: playConfirmSound },
	});
}

export function useEditIncome() {
	const { slug } = routeApi.useParams();
	const collection = incomeCollectionFactory(slug);

	return useLocalMutation<
		{ id: string; payload: IncomePatchSchema },
		{ id: string; payload: IncomePatchSchema }
	>({
		mutationFnName: MUTATION_FNS.income,
		prepare: ({ id, payload }) => ({ id, payload }),
		onMutate: ({ id, payload }) => {
			collection.update(id, (draft) => {
				if (payload.title !== undefined) draft.title = payload.title;
				if (payload.description !== undefined) draft.description = payload.description;
				if (payload.amount !== undefined) draft.amount = payload.amount;
				if (payload.currency !== undefined) draft.currency = payload.currency;
				if (payload.repeat !== undefined) draft.repeat = payload.repeat;
				if (payload.date !== undefined) draft.date = payload.date;
				if (payload.walletId !== undefined) draft.wallet_id = payload.walletId;
				if (payload.categoryId !== undefined) draft.category_id = payload.categoryId;
				draft.updated_at = new Date().toISOString();
			});
		},
		success: { title: "Income updated.", sound: playConfirmSound },
	});
}

export function useDeleteIncome() {
	const { slug } = routeApi.useParams();
	const collection = incomeCollectionFactory(slug);

	return useLocalMutation<{ id: string }, { id: string }>({
		mutationFnName: MUTATION_FNS.income,
		prepare: ({ id }) => ({ id }),
		onMutate: ({ id }) => {
			collection.delete(id);
		},
		success: { title: "Income deleted.", haptic: "warning", sound: playDropSound },
	});
}

export function useDuplicateIncome() {
	const { slug } = routeApi.useParams();
	const navigate = useNavigate();
	const setDraft = draftIncome$.set;

	const mutation = useMutation({
		mutationFn: async ({ sourceIncome }: { sourceIncome: SyncedIncome }) => {
			if (!sourceIncome) return;

			setDraft({
				title: sourceIncome.title,
				description: sourceIncome.description ?? "",
				date: new Date().toISOString(),
				transaction: {
					value: sourceIncome.realAmount,
					currency: sourceIncome.currency,
				},
				walletId: sourceIncome.wallet.id,
				categoryId: sourceIncome.category?.id ?? "",
			});
			void navigate({
				to: "/$slug/transactions/new",
				params: { slug },
				search: { type: "income" },
			});

			return sourceIncome;
		},
	});

	return mutation;
}

export function useCreateRecurringBill() {
	const { slug } = routeApi.useParams();
	const collection = recurringBillCollectionFactory(slug);
	const workspace = useWorkspace();

	return useLocalMutation<
		{ payload: Record<string, unknown> },
		{ payload: Record<string, unknown>; id: string; publicId: string }
	>({
		mutationFnName: MUTATION_FNS.recurringBill,
		prepare: ({ payload }) => ({
			payload,
			id: generateId({ use: "uuid" }),
			publicId: generateId({ use: "nanoid", kind: "recurring_bill" }),
		}),
		onMutate: ({ payload, id, publicId }) => {
			const timestamp = new Date().toISOString();
			const repeat = toRepeat(payload.repeat, "monthly");
			collection.insert({
				id,
				public_id: publicId,
				title: typeof payload.title === "string" ? payload.title : "",
				description: typeof payload.description === "string" ? payload.description : null,
				amount: Number(payload.amount ?? 0),
				currency: typeof payload.currency === "string" ? payload.currency : "USD",
				repeat,
				anchor_date:
					typeof payload.anchorDate === "string"
						? payload.anchorDate
						: new Date().toISOString().slice(0, 10),
				due_day: typeof payload.dueDay === "number" ? payload.dueDay : null,
				due_month: typeof payload.dueMonth === "number" ? payload.dueMonth : null,
				wallet_id: typeof payload.walletId === "string" ? payload.walletId : "",
				category_id: typeof payload.categoryId === "string" ? payload.categoryId : null,
				event_id: typeof payload.eventId === "string" ? payload.eventId : null,
				workspace_id: workspace.id,
				is_active: true,
				created_at: timestamp,
				updated_at: timestamp,
			});
		},
		success: { title: "Recurring bill created.", sound: playConfirmSound },
	});
}

/**
 * Creates a recurring bill from an existing expense, then links the expense to it.
 * Used by the "Set up recurring bill" prompt in the expense detail panel.
 */
export function useSetUpRecurringBill() {
	const { slug } = routeApi.useParams();
	const billCollection = recurringBillCollectionFactory(slug);
	const expenseCollection = expenseCollectionFactory(slug);

	type SetupPayload = {
		id: string;
		title: string;
		amount: number;
		currency: string;
		repeat: string;
		date: string;
		walletId: string;
		categoryId: string | null | undefined;
		workspaceId: string;
	};

	return useLocalMutation<
		{ payload: SetupPayload },
		{ payload: SetupPayload; billId: string; publicId: string }
	>({
		mutationFnName: MUTATION_FNS.setupRecurringBill,
		prepare: ({ payload }) => ({
			payload,
			billId: generateId({ use: "uuid" }),
			publicId: generateId({ use: "nanoid", kind: "recurring_bill" }),
		}),
		onMutate: ({ payload, billId, publicId }) => {
			const timestamp = new Date().toISOString();
			billCollection.insert({
				id: billId,
				public_id: publicId,
				title: payload.title,
				description: null,
				amount: payload.amount,
				currency: payload.currency,
				repeat: toRepeat(payload.repeat, "monthly"),
				anchor_date: payload.date.slice(0, 10),
				due_day: null,
				due_month: null,
				wallet_id: payload.walletId,
				category_id: payload.categoryId ?? null,
				event_id: null,
				workspace_id: payload.workspaceId,
				is_active: true,
				created_at: timestamp,
				updated_at: timestamp,
			});
			expenseCollection.update(payload.id, (draft) => {
				draft.recurring_bill_id = billId;
			});
		},
		success: { title: "Recurring bill set up.", sound: playConfirmSound },
	});
}

export function useEditRecurringBill() {
	const { slug } = routeApi.useParams();
	const collection = recurringBillCollectionFactory(slug);

	return useLocalMutation<
		{ id: string; payload: Record<string, unknown> },
		{ id: string; payload: Record<string, unknown> }
	>({
		mutationFnName: MUTATION_FNS.recurringBill,
		prepare: ({ id, payload }) => ({ id, payload }),
		onMutate: ({ id, payload }) => {
			collection.update(id, (draft) => {
				if (typeof payload.title === "string") draft.title = payload.title;
				if (typeof payload.description === "string") draft.description = payload.description;
				if (typeof payload.amount === "number") draft.amount = payload.amount;
				if (typeof payload.currency === "string") draft.currency = payload.currency;
				if (typeof payload.repeat === "string")
					draft.repeat = toRepeat(payload.repeat, draft.repeat);
				if (typeof payload.dueDay === "number") draft.due_day = payload.dueDay;
				if (typeof payload.dueMonth === "number") draft.due_month = payload.dueMonth;
				if (typeof payload.anchorDate === "string") draft.anchor_date = payload.anchorDate;
				if (typeof payload.walletId === "string") draft.wallet_id = payload.walletId;
				if (payload.categoryId !== undefined)
					draft.category_id = typeof payload.categoryId === "string" ? payload.categoryId : null;
				if (payload.eventId !== undefined)
					draft.event_id = typeof payload.eventId === "string" ? payload.eventId : null;
				if (typeof payload.isActive === "boolean") draft.is_active = payload.isActive;
				draft.updated_at = new Date().toISOString();
			});
		},
		success: { title: "Recurring bill updated.", sound: playConfirmSound },
	});
}

export function useArchiveRecurringBill() {
	const { slug } = routeApi.useParams();
	const collection = recurringBillCollectionFactory(slug);

	return useLocalMutation<{ id: string }, { id: string; payload: { isActive: boolean } }>({
		mutationFnName: MUTATION_FNS.recurringBill,
		prepare: ({ id }) => ({ id, payload: { isActive: false } }),
		onMutate: ({ id, payload }) => {
			collection.update(id, (draft) => {
				draft.is_active = payload.isActive;
				draft.updated_at = new Date().toISOString();
			});
		},
		success: { title: "Recurring bill removed.", haptic: "warning", sound: playDropSound },
	});
}

export function useUnarchiveRecurringBill() {
	const { slug } = routeApi.useParams();
	const collection = recurringBillCollectionFactory(slug);

	return useLocalMutation<{ id: string }, { id: string; payload: { isActive: boolean } }>({
		mutationFnName: MUTATION_FNS.recurringBill,
		prepare: ({ id }) => ({ id, payload: { isActive: true } }),
		onMutate: ({ id, payload }) => {
			collection.update(id, (draft) => {
				draft.is_active = payload.isActive;
				draft.updated_at = new Date().toISOString();
			});
		},
		success: { title: "Recurring bill restored.", sound: playConfirmSound },
	});
}

export function useDeleteRecurringBill() {
	const { slug } = routeApi.useParams();
	const collection = recurringBillCollectionFactory(slug);

	return useLocalMutation<{ id: string }, { id: string }>({
		mutationFnName: MUTATION_FNS.recurringBill,
		prepare: ({ id }) => ({ id }),
		onMutate: ({ id }) => {
			collection.delete(id);
		},
		success: { title: "Recurring bill deleted.", haptic: "warning", sound: playDropSound },
	});
}

/**
 * events
 */

export function useCreateEvent() {
	const { slug } = routeApi.useParams();
	const collection = eventCollectionFactory(slug);
	const workspace = useWorkspace();

	return useLocalMutation<
		{ payload: EventPostSchema },
		{ payload: EventPostSchema; id: string; publicId: string }
	>({
		mutationFnName: MUTATION_FNS.event,
		prepare: ({ payload }) => ({
			payload,
			id: generateId({ use: "uuid" }),
			publicId: generateId({ use: "nanoid", kind: "event" }),
		}),
		onMutate: ({ payload, id, publicId }) => {
			const timestamp = new Date().toISOString();
			collection.insert({
				id,
				public_id: publicId,
				title: payload.title,
				description: payload.description ?? null,
				start_date: payload.startDate ?? null,
				end_date: payload.endDate ?? null,
				budget: payload.budget ?? null,
				budget_currency: payload.currency ?? workspace.metadata.currency,
				status: "open",
				workspace_id: workspace.id,
				created_at: timestamp,
				updated_at: timestamp,
			});
		},
		success: { title: "Event created.", sound: playConfirmSound },
	});
}

export function useEditEvent() {
	const { slug } = routeApi.useParams();
	const collection = eventCollectionFactory(slug);

	return useLocalMutation<
		{ id: string; payload: EventPatchSchema },
		{ id: string; payload: EventPatchSchema }
	>({
		mutationFnName: MUTATION_FNS.event,
		prepare: ({ id, payload }) => ({ id, payload }),
		onMutate: ({ id, payload }) => {
			collection.update(id, (draft) => {
				if (payload.title !== undefined) draft.title = payload.title;
				if (payload.description !== undefined) draft.description = payload.description;
				if (payload.startDate !== undefined) draft.start_date = payload.startDate;
				if (payload.endDate !== undefined) draft.end_date = payload.endDate;
				if (payload.budget !== undefined) draft.budget = payload.budget;
				if (payload.currency !== undefined) draft.budget_currency = payload.currency;
				if (payload.status !== undefined) draft.status = payload.status;
				draft.updated_at = new Date().toISOString();
			});
		},
		success: { title: "Event updated.", sound: playConfirmSound },
	});
}

export function useDeleteEvent() {
	const { slug } = routeApi.useParams();
	const collection = eventCollectionFactory(slug);

	return useLocalMutation<{ id: string }, { id: string }>({
		mutationFnName: MUTATION_FNS.event,
		prepare: ({ id }) => ({ id }),
		onMutate: ({ id }) => {
			collection.delete(id);
		},
		success: { title: "Event deleted.", haptic: "warning", sound: playDropSound },
	});
}

export function useDuplicateExpense() {
	const { slug } = routeApi.useParams();
	const navigate = useNavigate();
	const setDraft = draftExpense$.set;

	const mutation = useMutation({
		mutationFn: async ({ sourceExpense }: { sourceExpense: SyncedExpense }) => {
			if (!sourceExpense) return;

			setDraft({
				title: sourceExpense.title,
				description: sourceExpense.description ?? "",
				date: new Date().toISOString(),
				transaction: {
					value: sourceExpense.realAmount,
					currency: sourceExpense.currency,
				},
				walletId: sourceExpense.wallet.id,
				categoryId: sourceExpense.category?.id ?? "",
				repeat: sourceExpense.repeat,
			});
			void navigate({
				to: "/$slug/transactions/new",
				params: { slug },
				search: { type: "expense" },
			});

			return sourceExpense;
		},
	});

	return mutation;
}

export function useUploadExpenseFiles() {
	const queryClient = useQueryClient();
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		networkMode: "always",
		mutationFn: async ({
			id,
			title,
			date,
			files,
		}: {
			id: string;
			title: string;
			date: string;
			files: File[];
		}) => {
			const ids = await Promise.all(
				files.map(async (file) => {
					const response = await apiClient.files.uploadWithPresignedUrl(slug, file, {
						title,
						tags: ["expense"],
					});
					return response.id;
				}),
			);
			await apiClient.files.createImageExpense(slug, id, { ids });
			return id;
		},
		onSuccess: (expenseId) => {
			void haptics.trigger("success");
			void queryClient.invalidateQueries({
				queryKey: [...fileKeys.all(slug), "expense", expenseId],
			});
		},
		onError: (error) => {
			void haptics.trigger("error");
			toastManager.add({
				title: "Uh oh! Something went wrong.",
				description: error.message,
				type: "error",
			});
		},
	});
	return mutation;
}

export function useDeleteExpenseFile() {
	const queryClient = useQueryClient();
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		networkMode: "always",
		mutationFn: async ({ expenseId, fileId }: { expenseId: string; fileId: string }) => {
			await apiClient.files.deleteExpenseFile(slug, expenseId, fileId);
			return { expenseId, fileId };
		},
		onSuccess: ({ expenseId }) => {
			void haptics.trigger("warning");
			void queryClient.invalidateQueries({
				queryKey: [...fileKeys.all(slug), "expense", expenseId],
			});
		},
		onError: (error) => {
			void haptics.trigger("error");
			toastManager.add({
				title: "Uh oh! Something went wrong.",
				description: error.message,
				type: "error",
			});
		},
	});
	return mutation;
}

/**
 * wallets
 */

export function useCreateWallet() {
	const { slug } = routeApi.useParams();
	const collection = walletCollectionFactory(slug);
	const ownerId = useCurrentUserId();

	return useLocalMutation<{ payload: WalletPostSchema }, { payload: WalletPostSchema; id: string }>(
		{
			mutationFnName: MUTATION_FNS.wallet,
			prepare: ({ payload }) => ({ payload, id: generateId({ use: "uuid" }) }),
			onMutate: ({ payload, id }) => {
				collection.insert({
					id,
					name: payload.name,
					description: payload.description ?? null,
					currency: payload.currency,
					type: payload.type,
					is_active: payload.isActive ?? true,
					owner_id: ownerId,
				});
			},
			success: { title: "Wallet created.", sound: playConfirmSound },
		},
	);
}

export function useEditWallet() {
	const { slug } = routeApi.useParams();
	const collection = walletCollectionFactory(slug);

	return useLocalMutation<
		{ id: string; payload: WalletPatchSchema },
		{ id: string; payload: WalletPatchSchema }
	>({
		mutationFnName: MUTATION_FNS.wallet,
		prepare: ({ id, payload }) => ({ id, payload }),
		onMutate: ({ id, payload }) => {
			collection.update(id, (draft) => {
				if (payload.name !== undefined) draft.name = payload.name;
				if (payload.description !== undefined) draft.description = payload.description;
				if (payload.currency !== undefined) draft.currency = payload.currency;
				if (payload.type !== undefined) draft.type = payload.type;
				if (payload.isActive !== undefined) draft.is_active = payload.isActive;
			});
		},
		success: { title: "Wallet updated.", sound: playConfirmSound },
	});
}

export function useDeleteWallet() {
	const { slug } = routeApi.useParams();
	const collection = walletCollectionFactory(slug);

	return useLocalMutation<{ id: string }, { id: string }>({
		mutationFnName: MUTATION_FNS.wallet,
		prepare: ({ id }) => ({ id }),
		onMutate: ({ id }) => {
			collection.delete(id);
		},
		success: { title: "Wallet deleted.", haptic: "warning", sound: playDropSound },
	});
}

/**
 * categories
 */

export function useCreateCategory() {
	const { slug } = routeApi.useParams();
	const collection = categoryCollectionFactory(slug);

	return useLocalMutation<
		{ payload: CategoryPostSchema },
		{ payload: CategoryPostSchema; id: string }
	>({
		mutationFnName: MUTATION_FNS.category,
		prepare: ({ payload }) => ({ payload, id: generateId({ use: "uuid" }) }),
		onMutate: ({ payload, id }) => {
			collection.insert({
				id,
				name: payload.name,
				description: payload.description ?? null,
				color: payload.color ?? "gray",
				type: payload.type,
			});
		},
		success: { title: "Category created.", sound: playConfirmSound },
	});
}

export function useEditCategory() {
	const { slug } = routeApi.useParams();
	const collection = categoryCollectionFactory(slug);

	return useLocalMutation<
		{ id: string; payload: CategoryPatchSchema },
		{ id: string; payload: CategoryPatchSchema }
	>({
		mutationFnName: MUTATION_FNS.category,
		prepare: ({ id, payload }) => ({ id, payload }),
		onMutate: ({ id, payload }) => {
			collection.update(id, (draft) => {
				if (payload.name !== undefined) draft.name = payload.name;
				if (payload.description !== undefined) draft.description = payload.description;
				if (payload.color !== undefined) draft.color = payload.color;
			});
		},
		success: { title: "Category updated.", sound: playConfirmSound },
	});
}

export function useDeleteCategory() {
	const { slug } = routeApi.useParams();
	const collection = categoryCollectionFactory(slug);

	return useLocalMutation<{ id: string }, { id: string }>({
		mutationFnName: MUTATION_FNS.category,
		prepare: ({ id }) => ({ id }),
		onMutate: ({ id }) => {
			collection.delete(id);
		},
		success: { title: "Category deleted.", haptic: "warning", sound: playDropSound },
	});
}
