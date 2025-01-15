import { SignupForm } from "@/components/forms/signup";
import { User } from "@/components/user";
import { tasksShapeOptions } from "@/services/shape-options";
import { preloadShape, useShape } from "@electric-sql/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	loader: async () => {
		preloadShape(tasksShapeOptions());
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { data: shapeData } = useShape(tasksShapeOptions());
	console.log(shapeData);

	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<SignupForm />
				<User />
			</div>
		</div>
	);
}
