import { User } from "@/components/user";
import { useAuth } from "@/hooks/useAuth";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { Button } from "@woben/ui/button";

export const Route = createFileRoute("/")({
	beforeLoad: ({ context: { user } }) => {
		if (!user) {
			throw redirect({ to: "/login" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const router = useRouter();
	const { authClient } = useAuth();

	async function formAction() {
		authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.invalidate();
				},
			},
		});
		router.invalidate();
	}

	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
			Dashboard here
			<User />
			<form action={formAction}>
				<Button type="submit">Sign out</Button>
			</form>
		</div>
	);
}
