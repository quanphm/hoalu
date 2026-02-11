import { ContentCard } from "#app/components/cards.tsx";
import { useAppForm } from "#app/components/forms/index.tsx";
import { authClient } from "#app/lib/auth-client.ts";
import { sessionOptions } from "#app/services/query-options.ts";
import { toastManager } from "@hoalu/ui/toast";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import * as z from "zod";

const searchSchema = z.object({
	redirect: z.string().default("/").catch("/"),
});

export const Route = createFileRoute("/_auth/login")({
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
						toastManager.add({
							title: "Something went wrong.",
							description: ctx.error.message,
							type: "error",
						});
					},
				},
			);
		},
	});

	return (
		<ContentCard
			title="Welcome back"
			description="Log in to your Hoalu account"
			className="bg-background border-transparent"
			content={
				<div className="grid gap-4">
					<form.AppForm>
						<form.Form>
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
									<div>
										<field.InputField
											label="Password"
											type="password"
											autoComplete="current-password"
											placeholder="•••••••••••••"
											required
										/>
										<Link to="/reset-password" className="text-muted-foreground text-sm underline">
											Forgot password?
										</Link>
									</div>
								)}
							/>
							<form.SubscribeButton className="w-full">Log in</form.SubscribeButton>
						</form.Form>
					</form.AppForm>

					<div className="text-center text-sm">
						Don&apos;t have an account?{" "}
						<Link to="/signup" search={search} className="underline underline-offset-4">
							Sign up
						</Link>
					</div>
				</div>
			}
		/>
	);
}
