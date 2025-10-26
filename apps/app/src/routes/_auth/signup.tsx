import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import * as z from "zod";

import { toastManager } from "@hoalu/ui/toast";

import { ContentCard } from "#app/components/cards.tsx";
import { useAppForm } from "#app/components/forms/index.tsx";
import { authClient } from "#app/lib/auth-client.ts";
import { authKeys } from "#app/lib/query-key-factory.ts";
import { sessionOptions } from "#app/services/query-options.ts";

const searchSchema = z.object({
	redirect: z.string().default("/").catch("/"),
});

export const Route = createFileRoute("/_auth/signup")({
	validateSearch: searchSchema,
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
						toastManager.add({
							title: "Uh oh! Something went wrong.",
							description: ctx.error.message,
							type: "error",
						});
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
							<form.AppField
								name="name"
								children={(field) => (
									<field.InputField
										label="Full name"
										placeholder="John Doe"
										autoComplete="name"
										required
									/>
								)}
							/>
							<form.AppField
								name="email"
								children={(field) => (
									<field.InputField
										label="Email"
										type="email"
										placeholder="your.email@hoalu.app"
										required
									/>
								)}
							/>
							<form.AppField
								name="password"
								children={(field) => (
									<field.InputField
										label="Password"
										type="password"
										autoComplete="new-password"
										placeholder="•••••••••••••"
										required
									/>
								)}
							/>
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
