import { HTTPStatus } from "@hoalu/common/http-status";
import type { Env } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

type AuthEnv = {
	Variables: {
		user: any;
		session: any;
	};
} & Env;

export const authGuard = <E extends AuthEnv>() => {
	return createMiddleware<E>(async (c, next) => {
		const user = c.get("user");
		if (!user) {
			throw new HTTPException(HTTPStatus.codes.UNAUTHORIZED, {
				message: HTTPStatus.phrases.UNAUTHORIZED,
			});
		}
		await next();
	});
};
