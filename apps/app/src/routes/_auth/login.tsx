import { authClient } from "@/lib/auth-client";
import { Button } from "@hoalu/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@hoalu/ui/card";
import { Input } from "@hoalu/ui/input";
import { Label } from "@hoalu/ui/label";
import { toast } from "@hoalu/ui/sonner";
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const search = Route.useSearch();

	async function formAction(formData: FormData) {
		const email = formData.get("email");
		const password = formData.get("password");

		if (!email) throw new Error("Email can not be empty");
		if (!password) throw new Error("Password can not be empty");

		await authClient.signIn.email(
			{
				email: email.toString(),
				password: password.toString(),
				callbackURL: search.redirect || "/",
				rememberMe: true,
			},
			{
				onError: (ctx) => {
					toast.error(ctx.error.message);
				},
			},
		);
	}

	return (
		<Card>
			<CardHeader className="text-center">
				<CardTitle className="text-xl">Welcome back</CardTitle>
				<CardDescription>Log in to your Hoalu account</CardDescription>
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
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									name="email"
									type="email"
									required
									placeholder="your.email@hoalu.app"
									autoComplete="off"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									name="password"
									type="password"
									required
									placeholder="•••••••••••••"
									autoComplete="off"
								/>
								<div>
									<Link
										to="/"
										preload={false}
										className="text-sm underline-offset-4 hover:underline"
									>
										Forgot password?
									</Link>
								</div>
							</div>
							<Button type="submit" className="w-full">
								Log in
							</Button>
						</div>
						<div className="text-center text-sm">
							Don&apos;t have an account?{" "}
							<Link to="/signup" search={search} className="underline underline-offset-4">
								Sign up
							</Link>
						</div>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
