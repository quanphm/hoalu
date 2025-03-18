import { getWorkspaceDetailsOptions, getWorkspaceLogo } from "@/services/query-options";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

const routeApi = getRouteApi("/_dashboard/$slug");

export function useWorkspace() {
	const { slug } = routeApi.useParams();
	const { data: workspace } = useSuspenseQuery(getWorkspaceDetailsOptions(slug));
	const { data: logo } = useQuery(getWorkspaceLogo(workspace.slug));

	if (!logo) {
		return workspace;
	}

	return {
		...workspace,
		logo,
	};
}
