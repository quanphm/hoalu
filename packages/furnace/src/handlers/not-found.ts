import type { NotFoundHandler } from "hono";

import { HTTPStatus } from "@hoalu/common/http-status";

export const notFound: NotFoundHandler = (c) => {
	return c.json(
		{
			message: `${HTTPStatus.phrases.NOT_FOUND} - ${c.req.path}`,
		},
		HTTPStatus.codes.NOT_FOUND,
	);
};
