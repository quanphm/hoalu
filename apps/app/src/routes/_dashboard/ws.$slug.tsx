import { User } from "@/components/user";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/ws/$slug")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="overflow-hidden">
			<User />
		</div>
	);
}
