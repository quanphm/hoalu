import { createFileRoute } from "@tanstack/react-router";

import { Greeting } from "#app/components/greeting.tsx";
import { PageContent } from "#app/components/layouts/page-content.tsx";
import {
	Toolbar,
	ToolbarActions,
	ToolbarGroup,
	ToolbarSeparator,
	ToolbarTitle,
} from "#app/components/layouts/toolbar.tsx";
import { RedactedAmountToggle } from "#app/components/redacted-amount-toggle.tsx";
import { CreateWorkspaceTrigger } from "#app/components/workspace.tsx";
import { WorkspaceLedger } from "#app/components/workspaces/workspace-ledger.tsx";

export const Route = createFileRoute("/_dashboard/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<Toolbar>
				<ToolbarGroup>
					<ToolbarTitle>Home</ToolbarTitle>
				</ToolbarGroup>
				<ToolbarActions>
					<CreateWorkspaceTrigger />
					<ToolbarSeparator />
					<RedactedAmountToggle />
				</ToolbarActions>
			</Toolbar>
			<PageContent className="gap-6 p-6">
				<Greeting />
				<WorkspaceLedger />
			</PageContent>
		</>
	);
}
