import { toastManager } from "@hoalu/ui/toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { WebHaptics } from "web-haptics";

import { getOfflineExecutor } from "#app/lib/offline/executor.ts";
import { sessionOptions } from "#app/services/query-options.ts";

import type { HapticInput } from "web-haptics";

const haptics = new WebHaptics();
const routeApi = getRouteApi("/_dashboard/$slug");

interface LocalMutationOptions<TInput, TVars> {
	mutationFnName: string;
	/** Adds client-generated ids and defaults before the optimistic insert. */
	prepare: (input: TInput) => TVars;
	onMutate: (vars: TVars) => void;
	success: { title: string; haptic?: HapticInput; sound?: () => void };
}

function showError(error: Error) {
	void haptics.trigger("error");
	toastManager.add({
		title: "Uh oh! Something went wrong.",
		description: error.message,
		type: "error",
	});
}

/**
 * Writes through the offline executor: `onMutate` applies the optimistic row
 * synchronously, the outbox persists it, and `mutationFns` reconciles with the
 * server. The returned `mutate`/`mutateAsync` resolve as soon as the optimistic
 * state is applied, so screens never wait on the network.
 */
export function useLocalMutation<TInput, TVars>(options: LocalMutationOptions<TInput, TVars>) {
	const { slug } = routeApi.useParams();
	const executor = getOfflineExecutor(slug);

	return useMutation({
		// React Query pauses mutations while `navigator.onLine` is false. The
		// executor is exactly what makes an offline write work, so it must run.
		networkMode: "always",
		mutationFn: async (input: TInput) => {
			const vars = options.prepare(input);
			const action = executor.createOfflineAction<TVars>({
				mutationFnName: options.mutationFnName,
				onMutate: options.onMutate,
			});
			const transaction = action(vars);
			void transaction.when("settled").catch(showError);
			return vars;
		},
		onSuccess: () => {
			const { title, haptic, sound } = options.success;
			void haptics.trigger(haptic ?? "success");
			sound?.();
			toastManager.add({ title, type: "success" });
		},
	});
}

export function useCurrentUserId(): string {
	const { data } = useQuery(sessionOptions());
	return data?.user?.id ?? "";
}
