import { zValidator } from "@hono/zod-validator";
import { describeRoute } from "hono-openapi";
import * as z from "zod";

import { HTTPStatus } from "@hoalu/common/http-status";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import { OpenAPI } from "@hoalu/furnace";

import { CurrencySchema } from "#api/common/schema.ts";
import { createHonoInstance } from "#api/lib/create-app.ts";
import { ExchangeRateRepository } from "#api/routes/exchange-rates/repository.ts";
import { ExchangeRateSchema } from "#api/routes/exchange-rates/schema.ts";

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
			...OpenAPI.response(z.object({ data: ExchangeRateSchema }), HTTPStatus.codes.OK),
		},
	}),
	zValidator("query", z.object({ from: CurrencySchema, to: CurrencySchema }), (result, c) => {
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

		const parsed = ExchangeRateSchema.safeParse({
			date: rateInfo.date,
			from: rateInfo.fromCurrency,
			to: rateInfo.toCurrency,
			rate: rateInfo.exchangeRate,
			inverse_rate: rateInfo.inverseRate,
		});
		if (!parsed.success) {
			return c.json(
				{ message: createIssueMsg(parsed.error.issues) },
				HTTPStatus.codes.UNPROCESSABLE_ENTITY,
			);
		}

		return c.json({ data: parsed.data }, HTTPStatus.codes.OK);
	},
);

export default route;
