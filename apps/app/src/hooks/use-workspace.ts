import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

import { getWorkspaceDetailsOptions } from "@/services/query-options";

const routeApi = getRouteApi("/_dashboard/$slug");

export function useWorkspace() {
	const { slug } = routeApi.useParams();
	const { data: workspace } = useSuspenseQuery(getWorkspaceDetailsOptions(slug));

	return workspace;
}
