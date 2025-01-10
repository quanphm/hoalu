import { LoginForm } from "@/components/forms/login";
import { preloadShape, useShape } from "@electric-sql/react";
import { createFileRoute } from "@tanstack/react-router";

const userShape = () => ({
	url: `${import.meta.env.PUBLIC_API_URL}/sync`,
	params: {
		table: "user",
	},
});

export const Route = createFileRoute("/")({
	loader: async () => {
		preloadShape(userShape());
	},
	component: RouteComponent,
});

function RouteComponent() {
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
