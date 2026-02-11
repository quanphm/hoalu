import { draftExpenseAtom } from "#app/atoms/index.ts";
import { authClient } from "#app/lib/auth-client.ts";
import { clearAllWorkspaceCollections } from "#app/lib/collections/index.ts";
import { authKeys, workspaceKeys } from "#app/lib/query-key-factory.ts";
import { sessionOptions } from "#app/services/query-options.ts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { RESET } from "jotai/utils";

export function useAuth() {
	const router = useRouter();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const setExpenseDraft = useSetAtom(draftExpenseAtom);
	const { data, ...rest } = useQuery(sessionOptions());

	const signOut = async () => {
		authClient.signOut({
			fetchOptions: {
				onSuccess: async () => {
					queryClient.removeQueries({ queryKey: workspaceKeys.all });
					queryClient.removeQueries({ queryKey: authKeys.session });

					clearAllWorkspaceCollections();

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
	};

	return {
		...rest,
		signOut,
		user: data?.user,
		session: data?.session,
	};
}
