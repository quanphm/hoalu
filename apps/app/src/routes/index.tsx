import { LoginForm } from "@/components/forms/login";
import { User } from "@/components/user";
import { authClient } from "@/lib/auth-client";
import { usersQueryOptions } from "@/services/query-options";
import { userShapeOptions } from "@/services/shape-options";
import { preloadShape, useShape } from "@electric-sql/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	beforeLoad: async () => {
		const result = await authClient.getSession();
		console.log(result);
	},
	loader: async ({ context }) => {
		preloadShape(userShapeOptions());
		await context.queryClient.ensureQueryData(usersQueryOptions());
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { data: users } = useSuspenseQuery(usersQueryOptions());
	console.log(users);

	const { data: shapeData } = useShape(userShapeOptions());
	console.log(shapeData);

	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<LoginForm />
				<User />
			</div>
		</div>
	);
}
