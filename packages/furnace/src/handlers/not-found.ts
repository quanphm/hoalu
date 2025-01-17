import { HTTPStatus } from "@woben/common/http-status";
import type { NotFoundHandler } from "hono";

export const notFound: NotFoundHandler = (c) => {
	return c.json(
		{
			message: `${HTTPStatus.phrases.NOT_FOUND} - ${c.req.path}`,
		},
		HTTPStatus.codes.NOT_FOUND,
	);
};
