import type { NotFoundHandler } from "hono";
import { StatusCodes, StatusPhrases } from "../../utils";

export const notFound: NotFoundHandler = (c) => {
	return c.json(
		{
			message: `${StatusPhrases.NOT_FOUND} - ${c.req.path}`,
		},
		StatusCodes.NOT_FOUND,
	);
};
