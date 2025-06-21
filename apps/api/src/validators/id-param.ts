import { type } from "arktype";
import { validator as aValidator } from "hono-openapi/arktype";

import { HTTPStatus } from "@hoalu/common/http-status";

const IdSchema = type({
	id: "string.uuid.v7",
});

export const idParamValidator = aValidator("param", IdSchema, (result, c) => {
	if (!result.success) {
		return c.json({ message: "Invalid id param" }, HTTPStatus.codes.BAD_REQUEST);
	}
});
