import { draftExpenseAtom } from "@/atoms/expense";
import { authClient } from "@/lib/auth-client";
import { authKeys, workspaceKeys } from "@/services/query-key-factory";
import { sessionOptions } from "@/services/query-options";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { useCallback } from "react";

export function useAuth() {
	const router = useRouter();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const setExpenseDraft = useSetAtom(draftExpenseAtom);
	const { data, ...rest } = useQuery(sessionOptions());

	const signOut = useCallback(async () => {
		authClient.signOut({
			fetchOptions: {
				onSuccess: async () => {
					queryClient.removeQueries({ queryKey: workspaceKeys.all });
					queryClient.removeQueries({ queryKey: authKeys.session });
					router.invalidate().finally(() => {
						setExpenseDraft(RESET);
						navigate({
							to: "/login",
							search: {
								redirect: location.href,
							},
						});
					});
				},
			},
		});
	}, [navigate, router, queryClient.removeQueries, setExpenseDraft]);

	return {
		...rest,
		signOut,
		user: data?.user,
		session: data?.session,
	};
}
