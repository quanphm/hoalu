import { LoginForm } from "@/components/forms/login";
import { usersQueryOptions } from "@/services/query-options";
import { useShape } from "@electric-sql/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(usersQueryOptions());
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { data: users } = useSuspenseQuery(usersQueryOptions());

	const { data: shapeData } = useShape({
		// url: `${import.meta.env.PUBLIC_API_URL}/sync`,
		url: "http://localhost:4000/v1/shape",
		params: {
			table: "user",
		},
	});
	console.log(shapeData);

	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				{users.map((user) => (
					<p key={user.id}>
						{user.username} <i>{user.email}</i>
					</p>
				))}
				<LoginForm />
			</div>
		</div>
	);
}
