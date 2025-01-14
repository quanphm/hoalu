import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { StatusCodes, StatusPhrases } from "../../utils";

export const onError: ErrorHandler = (err, c) => {
	const currentStatus = "status" in err ? err.status : StatusCodes.INTERNAL_SERVER_ERROR;

	return c.json(
		{
			message: err.message || StatusPhrases.INTERNAL_SERVER_ERROR,
			stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
		},
		currentStatus as ContentfulStatusCode,
	);
};
