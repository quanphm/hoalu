import { CreateWorkspaceDialog } from "@/components/create-workspace-dialog";
import { CreateWorkspaceForm } from "@/components/create-workspace-form";
import { PageContent } from "@/components/layouts/page-content";
import { WorkspaceCard } from "@/components/workspace-card";
import { listWorkspacesOptions } from "@/lib/query-options";
import { PlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: workspaces } = useSuspenseQuery(listWorkspacesOptions());

	if (workspaces.length === 0) {
		return (
			<PageContent>
				<div className="flex flex-col gap-4">
					<div className="grid grid-cols-3 gap-6">
						<div className="col-span-2 flex flex-col">
							<h3 className="my-4 font-semibold text-xl">Create a new workspace</h3>
							<span className="mb-6 text-muted-foreground text-sm">
								Workspaces are shared environments where members can interact with content together.
							</span>
							<CreateWorkspaceForm />
						</div>
					</div>
				</div>
			</PageContent>
		);
	}

	return (
		<PageContent>
			<div className="flex flex-col gap-4">
				<div className="flex max-w-full items-center justify-between">
					<p className="font-semibold text-xl tracking-tight">Workspaces</p>
					<CreateWorkspaceDialog>
						<Button>
							<PlusIcon className="mr-2 size-4" /> Create workspace
						</Button>
					</CreateWorkspaceDialog>
				</div>
				<div className="grid grid-cols-3 gap-6">
					{workspaces.map((ws) => (
						<WorkspaceCard key={ws.id} {...ws} />
					))}
				</div>
			</div>
		</PageContent>
	);
}
