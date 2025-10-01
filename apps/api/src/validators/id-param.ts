import { arktypeValidator } from "@hono/arktype-validator";
import { type } from "arktype";

import { HTTPStatus } from "@hoalu/common/http-status";

const IdSchema = type({
	id: "string.uuid.v7",
});

export const idParamValidator = arktypeValidator("param", IdSchema, (result, c) => {
	if (!result.success) {
		return c.json({ message: "Invalid id param type" }, HTTPStatus.codes.BAD_REQUEST);
	}
});
