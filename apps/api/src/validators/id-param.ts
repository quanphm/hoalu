import { HTTPStatus } from "@hoalu/common/http-status";
import { type } from "arktype";
import { validator as aValidator } from "hono-openapi/arktype";

const idSchema = type({
	id: "string.uuid",
});

export const idParamValidator = aValidator("param", idSchema, (result, c) => {
	if (!result.success) {
		return c.json({ message: "Invalid id param" }, HTTPStatus.codes.BAD_REQUEST);
	}
});
