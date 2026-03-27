import { CreateEventDialogTrigger } from "#app/components/events/event-actions.tsx";
import { EventDetails } from "#app/components/events/event-details.tsx";
import { EventList } from "#app/components/events/event-list.tsx";
import { useLiveQueryEvents } from "#app/components/events/use-events.ts";
import {
	Section,
	SectionAction,
	SectionContent,
	SectionHeader,
	SectionTitle,
} from "#app/components/layouts/section.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/_normal/events")({
	component: RouteComponent,
});

function RouteComponent() {
	const events = useLiveQueryEvents();

	return (
		<Section>
			<SectionHeader>
				<SectionTitle>Events</SectionTitle>
				<SectionAction>
					<CreateEventDialogTrigger />
				</SectionAction>
			</SectionHeader>
			<SectionContent columns={12}>
				<div className="col-span-12 md:col-span-5 lg:col-span-4">
					<EventList events={events} />
				</div>
				<div className="col-span-12 md:col-span-7 lg:col-span-8">
					<EventDetails />
				</div>
			</SectionContent>
		</Section>
	);
}
