import { zValidator } from "@hono/zod-validator";
import * as z from "zod";

import { HTTPStatus } from "@hoalu/common/http-status";

const IdSchema = z.object({
	id: z.uuidv7(),
});

export const idParamValidator = zValidator("param", IdSchema, (result, c) => {
	if (!result.success) {
		return c.json({ message: "Invalid id param type" }, HTTPStatus.codes.BAD_REQUEST);
	}
});
