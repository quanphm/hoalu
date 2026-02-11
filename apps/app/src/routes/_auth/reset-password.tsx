import { ContentCard, ErrorCard } from "#app/components/cards.tsx";
import { useAppForm } from "#app/components/forms/index.tsx";
import { authClient } from "#app/lib/auth-client.ts";
import { ArrowLeft } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { toastManager } from "@hoalu/ui/toast";
import { createFileRoute, type ErrorComponentProps, Link } from "@tanstack/react-router";
import * as z from "zod";

const searchSchema = z.object({
	token: z.optional(z.string().min(1)),
});

export const Route = createFileRoute("/_auth/reset-password")({
	validateSearch: searchSchema,
	component: RouteComponent,
	errorComponent: ErrorComponent,
});

function RouteComponent() {
	const { token } = Route.useSearch();
	if (!token) {
		return <ResetPasswordRequest />;
	}
	return <SetNewPassword token={token} />;
}

function ResetPasswordRequest() {
	const form = useAppForm({
		defaultValues: {
			email: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.requestPasswordReset(
				{
					email: value.email,
					redirectTo: "/reset-password",
				},
				{
					onError: (ctx) => {
						toastManager.add({
							title: "Something went wrong.",
							description: ctx.error.message,
							type: "error",
						});
					},
					onSuccess: () => {
						toastManager.add({
							title: "Password request sent.",
							type: "success",
						});
						form.reset();
					},
				},
			);
		},
	});

	return (
		<ContentCard
			title="Reset password"
			description="Send a request to reset password"
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
										autoFocus
									/>
								)}
							/>
							<form.SubscribeButton className="w-full">Send</form.SubscribeButton>
						</form.Form>
					</form.AppForm>

					<Link
						to="/login"
						className="text-muted-foreground m-auto inline-flex max-w-fit items-center text-sm"
					>
						<ArrowLeft className="mr-2 size-3" />
						Back
					</Link>
				</div>
			}
		/>
	);
}

function SetNewPassword(props: { token: string }) {
	const navigate = Route.useNavigate();
	const form = useAppForm({
		defaultValues: {
			newPassword: "",
		},
		onSubmit: async ({ value }) => {
			const { data } = await authClient.resetPassword(
				{
					newPassword: value.newPassword,
					token: props.token,
				},
				{
					onError: (ctx) => {
						toastManager.add({
							title: "Something went wrong.",
							description: ctx.error.message,
							type: "error",
						});
					},
					onSuccess: () => {
						toastManager.add({
							title: "Password updated.",
							type: "success",
						});
					},
				},
			);
			if (data?.status) {
				navigate({ to: "/login" });
			}
		},
	});

	return (
		<ContentCard
			title="Reset password"
			description="Create new password for your account"
			className="bg-background border-transparent"
			content={
				<div className="grid gap-4">
					<form.AppForm>
						<form.Form>
							<form.AppField
								name="newPassword"
								children={(field) => (
									<field.InputField label="New password" type="password" required autoFocus />
								)}
							/>
							<form.SubscribeButton className="w-full">Set new password</form.SubscribeButton>
						</form.Form>
					</form.AppForm>
				</div>
			}
		/>
	);
}

function ErrorComponent(props: ErrorComponentProps) {
	return (
		<ErrorCard
			error={props.error}
			footer={
				<Button variant="outline" className="w-full" render={<Link to="/">Go to Home</Link>} />
			}
		/>
	);
}
