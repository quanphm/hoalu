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
	loader: async ({ context: { queryClient }, params: { slug } }) => {
		await queryClient.ensureQueryData(filesQueryOptions(slug));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = Route.useParams();
	const { data } = useSuspenseQuery(filesQueryOptions(slug));

	return (
		<>
			<Section className="gap-4">
				<SectionHeader>
					<SectionTitle className="text-lg">Photos</SectionTitle>
				</SectionHeader>
				<SectionContent>
					<ImageGallery data={data} />
				</SectionContent>
			</Section>

			<Section className="gap-4">
				<SectionHeader>
					<SectionTitle className="text-lg">Others</SectionTitle>
				</SectionHeader>
				<SectionContent>
					<p className="text-muted-foreground text-sm">WIP</p>
				</SectionContent>
			</Section>
		</>
	);
}
