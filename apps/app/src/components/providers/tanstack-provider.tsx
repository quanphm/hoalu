import { queryClient } from "#app/lib/query-client.ts";
import { QueryClientProvider } from "@tanstack/react-query";

export default function TanStackQueryProvider(props: { children: React.ReactNode }) {
	return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
}
