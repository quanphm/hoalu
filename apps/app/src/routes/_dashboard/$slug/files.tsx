import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { ImageGallery } from "#app/components/image-gallery.tsx";
import {
	Section,
	SectionContent,
	SectionHeader,
	SectionTitle,
} from "#app/components/layouts/section.tsx";
import { filesQueryOptions } from "#app/services/query-options.ts";

export const Route = createFileRoute("/_dashboard/$slug/files")({
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = Route.useParams();
	const { data } = useSuspenseQuery(filesQueryOptions(slug));

	return (
		<>
			<Section>
				<SectionHeader>
					<SectionTitle>Photos</SectionTitle>
				</SectionHeader>
				<SectionContent>
					<ImageGallery data={data} />
				</SectionContent>
			</Section>

			<Section>
				<SectionHeader>
					<SectionTitle>Others</SectionTitle>
				</SectionHeader>
				<SectionContent>WIP</SectionContent>
			</Section>
		</>
	);
}
