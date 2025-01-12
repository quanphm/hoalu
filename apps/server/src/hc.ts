/**
 * @see https://github.com/m-shaka/hono-rpc-perf-tips-example/blob/main/apps/server/src/hc.ts
 */

import { hc as honoClient } from "hono/client";
import type { ApiRoutes } from "./types";

const client = honoClient<ApiRoutes>("");
export type Client = typeof client;

export const hc = (...args: Parameters<typeof honoClient>): Client =>
	honoClient<ApiRoutes>(...args);
