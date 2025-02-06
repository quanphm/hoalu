import { type RedisClient, RedisStore } from "@hono-rate-limiter/redis";
import { rateLimiter as honoRateLimiter } from "hono-rate-limiter";

export const rateLimiter = (client: RedisClient) => {
	return honoRateLimiter({
		windowMs: 10 * 60 * 1000,
		limit: 100,
		standardHeaders: "draft-6",
		keyGenerator: (c) => c.req.header("cf-connecting-ip") ?? "",
		store: new RedisStore({ client }),
	});
};
