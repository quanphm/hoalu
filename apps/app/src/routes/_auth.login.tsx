import { LoginForm } from "@/components/forms/login";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/login")({
	component: RouteComponent,
});

function RouteComponent() {
	return <LoginForm />;
}
