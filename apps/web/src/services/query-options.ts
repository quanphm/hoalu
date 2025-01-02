import { queryOptions } from "@tanstack/react-query";
import { userKeys } from "./query-key-factory";
import * as serverFn from "./server-fn";

export const usersQueryOptions = () => {
	return queryOptions({
		queryKey: userKeys.all,
		queryFn: () => serverFn.fetchUsers(),
	});
};
