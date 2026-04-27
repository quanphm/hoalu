import { Empty, EmptyHeader, EmptyTitle } from "@hoalu/ui/empty";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/_toolbar-and-queue/transactions/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex h-full flex-col gap-x-6 gap-y-4 overflow-auto rounded-none border border-b-0 p-0">
			<Empty>
				<EmptyHeader>
					<EmptyTitle>Select an expense to view details</EmptyTitle>
				</EmptyHeader>
			</Empty>
		</div>
	);
}
