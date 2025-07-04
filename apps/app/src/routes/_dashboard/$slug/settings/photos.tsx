import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { ImageGallery } from "@/components/image-gallery";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { filesQueryOptions } from "@/services/query-options";

export const Route = createFileRoute("/_dashboard/$slug/settings/photos")({
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = Route.useParams();
	const { data } = useSuspenseQuery(filesQueryOptions(slug));

	return (
		<Section>
			<SectionHeader>
				<SectionTitle>Uploaded</SectionTitle>
			</SectionHeader>
			<SectionContent>
				<ImageGallery data={data} />
			</SectionContent>
		</Section>
	);
}
