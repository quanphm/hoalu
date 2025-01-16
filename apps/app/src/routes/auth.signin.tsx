import { SigninForm } from "@/components/forms/signin";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/signin")({
	component: RouteComponent,
});

function RouteComponent() {
	return <SigninForm />;
}
