import { usersQueryOptions } from "@/services/query-options";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(usersQueryOptions());
	},
	component: RouteComponent,
});

function RouteComponent() {
	const usersQuery = useSuspenseQuery(usersQueryOptions());
	console.log(usersQuery.data);

	return (
		<div>
			<button type="button">Add user</button>
		</div>
	);
}
