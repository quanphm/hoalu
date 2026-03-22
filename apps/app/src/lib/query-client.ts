import { TIME_IN_MILLISECONDS } from "@hoalu/common/datetime";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 2,
			staleTime: TIME_IN_MILLISECONDS.DAY,
		},
	},
});
