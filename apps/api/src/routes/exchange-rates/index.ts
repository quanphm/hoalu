import { arktypeValidator } from "@hono/arktype-validator";
import { type } from "arktype";
import { describeRoute } from "hono-openapi";

import { HTTPStatus } from "@hoalu/common/http-status";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import { OpenAPI } from "@hoalu/furnace";
import { CurrencySchema } from "../../common/schema";
import { createHonoInstance } from "../../lib/create-app";
import { ExchangeRateRepository } from "./repository";
import { ExchangeRateSchema } from "./schema";

const app = createHonoInstance();
const exchangeRateRepository = new ExchangeRateRepository();
const TAGS = ["Exchange Rates"];

const route = app.get(
	"/",
	describeRoute({
		tags: TAGS,
		summary: "Get exchange rates",
		responses: {
			...OpenAPI.unauthorized(),
			...OpenAPI.bad_request(),
			...OpenAPI.server_parse_error(),
			...OpenAPI.response(type({ data: ExchangeRateSchema }), HTTPStatus.codes.OK),
		},
	}),
	arktypeValidator("query", type({ from: CurrencySchema, to: CurrencySchema }), (result, c) => {
		if (!result.success) {
			return c.json({ message: "Invalid query" }, HTTPStatus.codes.BAD_REQUEST);
		}
	}),
	async (c) => {
		const { from, to } = c.req.valid("query");
		const today = new Date().toISOString();

		const rateInfo = await exchangeRateRepository.lookup([from, to], today);
		if (!rateInfo) {
			return c.json({ message: "Exchange rate not found" }, HTTPStatus.codes.NOT_FOUND);
		}

		const parsed = ExchangeRateSchema({
			date: rateInfo.date,
			from: rateInfo.fromCurrency,
			to: rateInfo.toCurrency,
			rate: rateInfo.exchangeRate,
			inverse_rate: rateInfo.inverseRate,
		});
		if (parsed instanceof type.errors) {
			return c.json(
				{ message: createIssueMsg(parsed.issues) },
				HTTPStatus.codes.UNPROCESSABLE_ENTITY,
			);
		}

		return c.json({ data: parsed }, HTTPStatus.codes.OK);
	},
);

export default route;
