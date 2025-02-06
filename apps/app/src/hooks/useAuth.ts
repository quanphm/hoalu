import { sessionOptions } from "@/services/query-options";
import { useQuery } from "@tanstack/react-query";

export function useAuth() {
	const { data, ...rest } = useQuery(sessionOptions());
	return {
		...rest,
		user: data?.user,
		session: data?.session,
	};
}
