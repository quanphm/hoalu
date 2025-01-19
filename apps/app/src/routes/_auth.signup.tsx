import { SignupForm } from "@/components/forms/signup";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/signup")({
	component: RouteComponent,
});

function RouteComponent() {
	return <SignupForm />;
}
