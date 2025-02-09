import { authClient } from "@/lib/auth-client";
import { authKeys } from "@/services/query-key-factory";
import { Button } from "@hoalu/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@hoalu/ui/card";
import { Input } from "@hoalu/ui/input";
import { Label } from "@hoalu/ui/label";
import { toast } from "@hoalu/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/signup")({
	component: RouteComponent,
});

function RouteComponent() {
	const router = useRouter();
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	const queryClient = useQueryClient();

	async function formAction(formData: FormData) {
		const name = formData.get("name");
		const email = formData.get("email");
		const password = formData.get("password");

		if (!name) throw new Error("Name can not be empty");
		if (!email) throw new Error("Email can not be empty");
		if (!password) throw new Error("Password can not be empty");

		await authClient.signUp.email(
			{
				name: name.toString(),
				email: email.toString(),
				password: password.toString(),
			},
			{
				onError: (ctx) => {
					toast.error(ctx.error.message);
				},
				onSuccess: async () => {
					await queryClient.refetchQueries({ queryKey: authKeys.session });
					router.invalidate().finally(() => {
						navigate({ to: "/" });
					});
				},
			},
		);
	}

	return (
		<Card>
			<CardHeader className="text-center">
				<CardTitle className="text-xl">Welcome to Hoalu</CardTitle>
				<CardDescription>Let's set up your new account</CardDescription>
			</CardHeader>
			<CardContent>
				<form action={formAction}>
					<div className="grid gap-4">
						<div className="flex flex-col gap-4">
							<Button variant="outline" className="w-full">
								Continue with Google
							</Button>
						</div>
						<div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
							<span className="relative z-10 bg-background px-2 text-muted-foreground">or</span>
						</div>
						<div className="grid gap-4">
							<div className="grid gap-2">
								<Label htmlFor="name">Full name</Label>
								<Input id="name" name="name" placeholder="John Doe" required />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="your.email@hoalu.app"
									required
								/>
							</div>
							<div className="grid gap-2">
								<div className="flex items-center">
									<Label htmlFor="password">Password</Label>
								</div>
								<Input
									id="password"
									name="password"
									type="password"
									placeholder="•••••••••••••"
									required
								/>
							</div>
							<Button type="submit" className="w-full">
								Sign up
							</Button>
						</div>
						<div className="text-center text-sm">
							Already have an account?{" "}
							<Link to="/login" search={search} className="underline underline-offset-4">
								Log in
							</Link>
						</div>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
