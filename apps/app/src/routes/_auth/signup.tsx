import { useAppForm } from "@/components/forms";
import { authClient } from "@/lib/auth-client";
import { authKeys } from "@/services/query-key-factory";
import { Button } from "@hoalu/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@hoalu/ui/card";
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

	const form = useAppForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					name: value.name,
					email: value.email,
					password: value.password,
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
		},
	});

	return (
		<Card>
			<CardHeader className="text-center">
				<CardTitle className="text-xl">Welcome to Hoalu</CardTitle>
				<CardDescription>Let's set up your new account</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4">
					<div className="flex flex-col gap-4">
						<Button variant="outline" className="w-full">
							Continue with Google
						</Button>
					</div>
					<div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
						<span className="relative z-10 bg-background px-2 text-muted-foreground">or</span>
					</div>

					<form.AppForm>
						<form.Form>
							<form.AppField name="name">
								{(field) => <field.InputField label="Full name" placeholder="John Doe" required />}
							</form.AppField>
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
										placeholder="•••••••••••••"
										required
									/>
								)}
							</form.AppField>
							<Button type="submit" className="w-full">
								Sign up
							</Button>
						</form.Form>
					</form.AppForm>

					<div className="text-center text-sm">
						Already have an account?{" "}
						<Link to="/login" search={search} className="underline underline-offset-4">
							Log in
						</Link>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
