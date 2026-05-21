import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

import { getWorkspaceDetailsOptions } from "#app/services/query-options.ts";

const routeApi = getRouteApi("/_dashboard/$slug");

export function useWorkspace() {
	const { slug } = routeApi.useParams();
	const { data: workspace } = useSuspenseQuery(getWorkspaceDetailsOptions(slug));

	return workspace;
}
