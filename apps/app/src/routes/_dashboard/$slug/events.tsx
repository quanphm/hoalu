import { CreateEventDialogTrigger } from "#app/components/events/event-actions.tsx";
import { EventDetails } from "#app/components/events/event-details.tsx";
import EventList from "#app/components/events/event-list.tsx";
import { PageContent } from "#app/components/layouts/page-content.tsx";
import { Section, SectionContent, SectionItem } from "#app/components/layouts/section.tsx";
import {
	Toolbar,
	ToolbarActions,
	ToolbarGroup,
	ToolbarSeparator,
	ToolbarTitle,
} from "#app/components/layouts/toolbar.tsx";
import { RedactedAmountToggle } from "#app/components/redacted-amount-toggle.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/events")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<Toolbar>
				<ToolbarGroup>
					<ToolbarTitle>Events</ToolbarTitle>
				</ToolbarGroup>
				<ToolbarActions>
					<CreateEventDialogTrigger />
					<ToolbarSeparator />
					<RedactedAmountToggle />
				</ToolbarActions>
			</Toolbar>

			<PageContent>
				<Section>
					<SectionContent
						columns={12}
						className="h-[calc(100vh-94px)] gap-0 overflow-hidden max-md:h-[calc(100vh-94px)] md:gap-0"
					>
						<SectionItem className="col-span-12 md:col-span-5 lg:col-span-4">
							<EventList />
						</SectionItem>
						<SectionItem className="col-span-12 md:col-span-7 lg:col-span-8">
							<EventDetails />
						</SectionItem>
					</SectionContent>
				</Section>
			</PageContent>
		</>
	);
}
