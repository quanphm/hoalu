import { LoginForm } from "@/components/forms/login";
import { usersQueryOptions } from "@/services/query-options";
import { preloadShape, useShape } from "@electric-sql/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

const userShape = () => ({
	url: `${import.meta.env.PUBLIC_API_URL}/sync`,
	params: {
		table: "user",
	},
});

export const Route = createFileRoute("/")({
	loader: async ({ context }) => {
		preloadShape(userShape());
		await context.queryClient.ensureQueryData(usersQueryOptions());
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { data: users } = useSuspenseQuery(usersQueryOptions());
	console.log(users);

	const { data: shapeData } = useShape<any>(userShape());

	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				{shapeData.map((user) => (
					<p key={user.id}>
						{user.username} <i>{user.email}</i>
					</p>
				))}
				<LoginForm />
			</div>
		</div>
	);
}
