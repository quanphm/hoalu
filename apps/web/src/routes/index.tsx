import { userKeys } from "@/services/query-key-factory";
import { usersQueryOptions } from "@/services/query-options";
import { createUser } from "@/services/server-fn";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(usersQueryOptions());
	},
	component: RouteComponent,
});

function RouteComponent() {
	const queryClient = useQueryClient();
	const { data } = useSuspenseQuery(usersQueryOptions());

	async function formAction(formData: FormData) {
		await createUser({ data: formData });
		queryClient.invalidateQueries({
			queryKey: userKeys.all,
		});
	}

	return (
		<div>
			{data.map((u: any) => (
				<p key={u.id}>{u.username}</p>
			))}

			<form action={formAction}>
				<input name="username" />
				<input name="email" />
				<button type="submit">Submit</button>
			</form>
		</div>
	);
}
