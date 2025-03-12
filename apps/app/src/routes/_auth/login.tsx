import { useAppForm } from "@/components/forms";
import { authClient } from "@/lib/auth-client";
import { Button } from "@hoalu/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@hoalu/ui/card";
import { toast } from "@hoalu/ui/sonner";
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const search = Route.useSearch();
	const form = useAppForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
					callbackURL: search.redirect || "/",
					rememberMe: true,
				},
				{
					onError: (ctx) => {
						toast.error(ctx.error.message);
					},
				},
			);
		},
	});

	return (
		<Card>
			<CardHeader className="text-center">
				<CardTitle className="text-xl">Welcome back</CardTitle>
				<CardDescription>Log in to your Hoalu account</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4">
					<div className="flex flex-col gap-4">
						<Button variant="outline" className="w-full">
							Continue with Google
						</Button>
					</div>
					<div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
						<span className="relative z-10 bg-card px-2 text-muted-foreground">or</span>
					</div>

					<form.AppForm>
						<form.Form>
							<form.AppField name="email">
								{(field) => (
									<field.InputField
										label="Email"
										type="email"
										placeholder="your.email@hoalu.app"
										required
									/>
								)}
							</form.AppField>
							<form.AppField name="password">
								{(field) => (
									<field.InputField
										label="Password"
										type="password"
										autoComplete="current-password"
										placeholder="•••••••••••••"
										required
									/>
								)}
							</form.AppField>
							<Button type="submit" className="w-full">
								Log in
							</Button>
						</form.Form>
					</form.AppForm>

					<div className="text-center text-sm">
						Don&apos;t have an account?{" "}
						<Link to="/signup" search={search} className="underline underline-offset-4">
							Sign up
						</Link>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
