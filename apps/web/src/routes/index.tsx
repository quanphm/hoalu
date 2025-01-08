import { LoginForm } from "@/components/forms/login";
import { usersQueryOptions } from "@/services/query-options";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(usersQueryOptions());
	},
	component: RouteComponent,
});

function RouteComponent() {
	// const { data: users } = useSuspenseQuery(usersQueryOptions());
	// const { data: shapeData } = useShape({
	// 	url: new URL(import.meta.env.PUBLIC_SYNC_URL + "/v1/shape").href,
	// 	params: {
	// 		table: "user",
	// 	},
	// });

	// async function formAction(formData: FormData) {
	// 	const username = formData.get("username");
	// 	const email = formData.get("email");
	//
	// 	if (!username || !email) {
	// 		throw new Error("username or email can not be empty");
	// 	}
	//
	// 	await createUser({
	// 		username: username.toString(),
	// 		email: email.toString(),
	// 	});
	//
	// 	queryClient.invalidateQueries({ queryKey: userKeys.all });
	// }

	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<LoginForm />
			</div>
		</div>
	);
}
