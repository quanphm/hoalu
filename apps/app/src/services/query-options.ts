import { queryOptions } from "@tanstack/react-query";
import * as api from "./api";
import { userKeys } from "./query-key-factory";

export const usersQueryOptions = () => {
	return queryOptions({
		queryKey: userKeys.all,
		queryFn: () => api.fetchUsers(),
	});
};
