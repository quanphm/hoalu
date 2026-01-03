import { describeRoute, openAPIRouteHandler } from "hono-openapi";
import * as z from "zod";

import { HTTPStatus } from "@hoalu/common/http-status";
import { OpenAPI, RATE_LIMIT_MAX_CONNECTIONS, rateLimiter } from "@hoalu/furnace";

import { createHonoInstance } from "#api/lib/create-app.ts";
import { redis } from "#api/lib/redis.ts";

const TAGS = ["Health"];

export function healthModule() {
	const app = createHonoInstance()
		.basePath("/health")
		.get(
			"/status",
			describeRoute({
				tags: TAGS,
				summary: "System healthchecks",
				responses: {
					...OpenAPI.response(
						z.object({
							status: z.literal("ok"),
						}),
						HTTPStatus.codes.OK,
					),
				},
			}),
			(c) => {
				return c.json({ status: "ok" });
			},
		)
		.get(
			"/rate-limit",
			rateLimiter(redis),
			describeRoute({
				tags: TAGS,
				summary: "Rate limiter test",
				responses: {
					...OpenAPI.response(
						z.object({
							timestamp: z.string(),
							rateLimit: z.object({
								limit: z.number(),
								remaining: z.number(),
								reset: z.string(),
							}),
							requestCount: z.number(),
						}),
						HTTPStatus.codes.OK,
					),
				},
			}),
			async (c) => {
				const limit = c.res.headers.get("RateLimit-Limit");
				const remaining = c.res.headers.get("RateLimit-Remaining");
				const reset = c.res.headers.get("RateLimit-Reset");

				return c.json({
					timestamp: new Date().toISOString(),
					rateLimit: {
						limit: limit ? Number.parseInt(limit, 10) : RATE_LIMIT_MAX_CONNECTIONS,
						remaining: remaining ? Number.parseInt(remaining, 10) : 0,
						reset: reset ? new Date(Number.parseInt(reset, 10) * 1000).toISOString() : "",
					},
					requestCount:
						limit && remaining ? Number.parseInt(limit, 10) - Number.parseInt(remaining, 10) : 0,
				});
			},
		);

	app.get(
		"/openapi",
		openAPIRouteHandler(app, {
			documentation: {
				info: {
					title: "Hoalu API",
					description: "OpenAPI documentation",
					version: "0.17.0",
				},
				servers: [{ url: process.env.PUBLIC_API_URL }],
			},
		}),
	);

	return app;
}
