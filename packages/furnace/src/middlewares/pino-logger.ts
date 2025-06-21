import { createMiddleware } from "hono/factory";
import { type PinoLogger, pinoLogger } from "hono-pino";
import pino from "pino";
import pinoPretty from "pino-pretty";

export const logger = ({
	enabled = true,
	...options
}: {
	enabled?: boolean;
	pretty?: boolean;
	excludePaths?: string[];
}) => {
	const shouldExcludePath = (path: string) => {
		if (!options?.excludePaths) {
			return false;
		}

		return options.excludePaths.some(
			(excludedPath) => path.startsWith(excludedPath) || path.startsWith(`/${excludedPath}`),
		);
	};

	return createMiddleware(async (c, next) => {
		if (!enabled) {
			return next();
		}

		if (shouldExcludePath(c.req.path)) {
			return next();
		}

		if (c.req.method === "OPTIONS") {
			return next();
		}

		return pinoLogger({
			pino: pino(
				{
					level: "info",
				},
				options?.pretty ? pinoPretty() : undefined,
			),
			http: {
				reqId: () => crypto.randomUUID(),
				onReqBindings: (c) => ({
					req: {
						url: c.req.url,
						method: c.req.method,
						query: c.req.query(),
					},
				}),
				onResBindings: (c) => ({
					res: {
						status: c.res.status,
					},
				}),
			},
		})(c, next);
	});
};

export type { PinoLogger };
