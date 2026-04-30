import { CreateEventDialogTrigger } from "#app/components/events/event-actions.tsx";
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
import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import { useRef } from "react";

export const Route = createFileRoute("/_dashboard/$slug/events")({
	component: LayoutComponent,
});

function LayoutComponent() {
	const matches = useMatches();
	const eventMatch = matches.find((m) => m.routeId === "/_dashboard/$slug/events/$eventId");
	const eventId = eventMatch ? (eventMatch.params as Record<string, string>).eventId : undefined;
	const listScrollRef = useRef(0);

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
				<Section className="gap-0">
					{eventId ? (
						<Outlet />
					) : (
						<SectionContent
							columns={12}
							className="h-[calc(100vh-49px)] grid-cols-1 overflow-hidden md:gap-0"
						>
							<SectionItem desktopSpan="col-span-12" tabletSpan={1} mobileOrder={1}>
								<EventList scrollRef={listScrollRef} />
							</SectionItem>
						</SectionContent>
					)}
				</Section>
			</PageContent>
		</>
	);
}
