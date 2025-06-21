import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import { HTTPStatus } from "@hoalu/common/http-status";

export const onError: ErrorHandler = (err, c) => {
	const currentStatus = "status" in err ? err.status : HTTPStatus.codes.INTERNAL_SERVER_ERROR;

	return c.json(
		{
			message: err.message || HTTPStatus.phrases.INTERNAL_SERVER_ERROR,
			stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
		},
		currentStatus as ContentfulStatusCode,
	);
};
