import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { FileLibrary, FileSearch } from "#app/components/files/file-library.tsx";
import { PageContent } from "#app/components/layouts/page-content.tsx";
import { Toolbar, ToolbarGroup, ToolbarTitle } from "#app/components/layouts/toolbar.tsx";
import { filesQueryOptions } from "#app/services/query-options.ts";

export const Route = createFileRoute("/_dashboard/$slug/files")({
	loader: async ({ context: { queryClient }, params: { slug } }) => {
		await queryClient.prefetchInfiniteQuery(filesQueryOptions(slug));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = Route.useParams();
	const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
		filesQueryOptions(slug),
	);
	const [query, setQuery] = useState("");

	const files = data.pages.flatMap((page) => page.data);
	const imageTotal = data.pages[0]?.totals.images ?? 0;
	const isSearching = query.trim().length > 0;

	useEffect(() => {
		if (!isSearching || !hasNextPage || isFetchingNextPage) return;
		void fetchNextPage();
	}, [isSearching, hasNextPage, isFetchingNextPage, fetchNextPage]);

	return (
		<>
			<Toolbar>
				<ToolbarGroup>
					<ToolbarTitle>Files</ToolbarTitle>
				</ToolbarGroup>
			</Toolbar>

			<PageContent>
				{files.length > 0 && (
					<div className="bg-card sticky top-0 z-20 flex w-full min-w-0 items-center gap-2 border-b px-4 py-2">
						<FileSearch value={query} onValueChange={setQuery} />
					</div>
				)}

				<div className="p-4">
					<FileLibrary
						files={files}
						imageTotal={imageTotal}
						query={query}
						hasNextPage={hasNextPage}
						isFetchingNextPage={isFetchingNextPage}
						onLoadMore={fetchNextPage}
					/>
				</div>
			</PageContent>
		</>
	);
}
