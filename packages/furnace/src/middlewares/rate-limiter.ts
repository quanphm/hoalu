import { createMiddleware } from "hono/factory";
import { rateLimiter as honoRateLimiter, type Store } from "hono-rate-limiter";
import { RedisStore } from "rate-limit-redis";

export const rateLimiter = <T>(client: T) => {
	return createMiddleware(async (c, next) => {
		return honoRateLimiter({
			windowMs: 10 * 60 * 1000, // 10 minutes
			limit: 10000,
			standardHeaders: "draft-6",
			keyGenerator: (c) => c.req.header("X-Forwared-For") ?? "",
			// @see https://www.npmjs.com/package/rate-limit-redis
			store: new RedisStore({
				// @ts-expect-error - Known issue: the `call` function is not present in @types/ioredis
				sendCommand: (...args: string[]) => client.call(...args),
			}) as unknown as Store,
			message: { message: "You've reached your limit", code: "RateLimitExceeded" },
		})(c, next);
	});
};
