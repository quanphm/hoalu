import { HTTPStatus } from "@hoalu/common/http-status";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import { OpenAPI } from "@hoalu/furnace";
import { type } from "arktype";
import { describeRoute } from "hono-openapi";
import { validator as aValidator } from "hono-openapi/arktype";
import { createHonoInstance } from "../../lib/create-app";
import { ExchangeRateRepository } from "./repository";
import { exchangeRateSchema } from "./schema";

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
			...OpenAPI.response(type({ data: exchangeRateSchema }), HTTPStatus.codes.OK),
		},
	}),
	aValidator("query", type({ from: "string = 'USD'", to: "string > 0" }), (result, c) => {
		if (!result.success) {
			return c.json({ message: "Invalid query" }, HTTPStatus.codes.BAD_REQUEST);
		}
	}),
	async (c) => {
		const query = c.req.valid("query");
		const from = query.from ?? "USD";
		const exchangeRate = await exchangeRateRepository.find({ from, to: query.to });
		if (!exchangeRate) {
			return c.json({ message: "Exchange rate not found" }, HTTPStatus.codes.NOT_FOUND);
		}

		const parsed = exchangeRateSchema({
			date: new Date().toISOString(),
			from,
			rates: [
				{
					[exchangeRate.toCurrency]: exchangeRate.exchangeRate,
				},
			],
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
