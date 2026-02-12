import { createHonoInstance } from "#api/lib/create-app.ts";
import { redis } from "#api/lib/redis.ts";
import { HTTPStatus } from "@hoalu/common/http-status";
import { OpenAPI, RATE_LIMIT_MAX_CONNECTIONS, rateLimiter } from "@hoalu/furnace";
import { describeRoute, openAPIRouteHandler } from "hono-openapi";
import * as z from "zod";

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
					...OpenAPI.response(z.object({ status: z.literal("ok") }), HTTPStatus.codes.OK),
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
								resetAt: z.string(),
								policy: z.string(),
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
				const resetAt = c.res.headers.get("RateLimit-Reset");
				const policy = c.res.headers.get("RateLimit-Policy");

				return c.json({
					timestamp: new Date().toISOString(),
					rateLimit: {
						limit: limit ? Number.parseInt(limit, 10) : RATE_LIMIT_MAX_CONNECTIONS,
						remaining: remaining ? Number.parseInt(remaining, 10) : 0,
						resetAt: resetAt
							? new Date(Date.now() + Number.parseInt(resetAt, 10) * 1000).toISOString()
							: "",
						policy: policy || "",
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
					version: "0.20.0",
				},
				servers: [{ url: process.env.PUBLIC_API_URL }],
			},
		}),
	);

	return app;
}
