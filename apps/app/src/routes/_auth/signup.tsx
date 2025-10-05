import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import * as z from "zod";

import { toast } from "@hoalu/ui/sonner";
import { ContentCard } from "@/components/cards";
import { useAppForm } from "@/components/forms";
import { authClient } from "@/lib/auth-client";
import { authKeys } from "@/lib/query-key-factory";
import { sessionOptions } from "@/services/query-options";

export const Route = createFileRoute("/_auth/signup")({
	validateSearch: z.object({
		redirect: z.string().catch("/"),
	}),
	beforeLoad: async ({ context: { queryClient }, search }) => {
		const auth = await queryClient.ensureQueryData(sessionOptions());
		if (auth?.user) {
			throw redirect({ to: search.redirect });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const router = useRouter();
	const navigate = useNavigate();
	const search = Route.useSearch();
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
		<ContentCard
			title="Welcome to Hoalu"
			description="Let's set up your new account"
			className="border-transparent bg-background"
			content={
				<div className="grid gap-4">
					{/* <div className="flex flex-col gap-4">
						<Button variant="outline" className="w-full">
							Continue with Google
						</Button>
					</div>
					<div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
						<span className="relative z-10 bg-card px-2 text-muted-foreground">or</span>
					</div> */}

					<form.AppForm>
						<form.Form>
							<form.AppField name="name">
								{(field) => (
									<field.InputField
										label="Full name"
										placeholder="John Doe"
										autoComplete="name"
										required
									/>
								)}
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
										autoComplete="new-password"
										placeholder="•••••••••••••"
										required
									/>
								)}
							</form.AppField>
							<form.SubscribeButton className="w-full">Sign up</form.SubscribeButton>
						</form.Form>
					</form.AppForm>

					<div className="text-center text-sm">
						Already have an account?{" "}
						<Link to="/login" search={search} className="underline underline-offset-4">
							Log in
						</Link>
					</div>
				</div>
			}
		/>
	);
}
