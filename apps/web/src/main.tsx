import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import { createRouter, queryClient } from "./router";
import { verifyEnv } from "./utils/env";

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement);
const router = createRouter();

console.log(import.meta.env);
verifyEnv();

root.render(
	<QueryClientProvider client={queryClient}>
		<RouterProvider router={router} />
	</QueryClientProvider>,
);
