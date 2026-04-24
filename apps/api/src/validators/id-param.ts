import { HTTPStatus } from "@hoalu/common/http-status";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import * as z from "zod";

const IdSchema = z.object({
	id: z.uuidv7(),
});

export const idParamValidator = zValidator("param", IdSchema, (result) => {
	if (!result.success) {
		throw new HTTPException(HTTPStatus.codes.BAD_REQUEST, {
			message: "Invalid id param type",
		});
	}
});
