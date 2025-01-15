import * as api from "@/services/api";
import { tasksKeys } from "@/services/query-key-factory";
import { queryOptions } from "@tanstack/react-query";

export const tasksQueryOptions = () => {
	return queryOptions({
		queryKey: tasksKeys.all,
		queryFn: () => api.fetchTasks(),
	});
};
