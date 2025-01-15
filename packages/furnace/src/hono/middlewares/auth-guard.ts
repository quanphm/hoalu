import { StatusCodes, StatusPhrases } from "@woben/furnace/utils";
import type { Env } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

type AuthEnv = {
	Variables: {
		user: any;
		session: any;
	};
} & Env;

export const authGuard = <T extends AuthEnv>() => {
	return createMiddleware<T>(async (c, next) => {
		const user = c.get("user");

		if (!user) {
			throw new HTTPException(StatusCodes.UNAUTHORIZED, {
				message: StatusPhrases.UNAUTHORIZED,
			});
		}

		await next();
	});
};
