import { createFileRoute, type ErrorComponentProps, Link } from "@tanstack/react-router";
import { type } from "arktype";

import { Button } from "@hoalu/ui/button";
import { toast } from "@hoalu/ui/sonner";
import { ContentCard, ErrorCard } from "@/components/cards";
import { useAppForm } from "@/components/forms";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth/reset-password")({
	validateSearch: type({
		"token?": "string > 0",
	}),
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
						toast.error(ctx.error.message);
					},
					onSuccess: () => {
						form.reset();
						toast.success("Password request sent");
					},
				},
			);
		},
	});

	return (
		<ContentCard
			title="Reset password"
			description="Send a request to reset password"
			content={
				<div className="grid gap-4">
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
							<Button type="submit" className="w-full">
								Send
							</Button>
						</form.Form>
					</form.AppForm>
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
						toast.error(ctx.error.message);
					},
					onSuccess: () => {
						toast.success("Password updated");
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
			content={
				<div className="grid gap-4">
					<form.AppForm>
						<form.Form>
							<form.AppField name="newPassword">
								{(field) => <field.InputField label="New password" type="password" required />}
							</form.AppField>
							<Button type="submit" className="w-full">
								Set new password
							</Button>
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
				<Button variant="outline" className="w-full" asChild>
					<Link to="/">Go to Home</Link>
				</Button>
			}
		/>
	);
}
