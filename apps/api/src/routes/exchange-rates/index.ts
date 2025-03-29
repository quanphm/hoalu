import { HTTPStatus } from "@hoalu/common/http-status";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import { OpenAPI } from "@hoalu/furnace";
import { type } from "arktype";
import { describeRoute } from "hono-openapi";
import { validator as aValidator } from "hono-openapi/arktype";
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
	aValidator("query", type({ from: CurrencySchema, to: CurrencySchema }), (result, c) => {
		if (!result.success) {
			return c.json({ message: "Invalid query" }, HTTPStatus.codes.BAD_REQUEST);
		}
	}),
	async (c) => {
		const { from, to } = c.req.valid("query");

		const useInverse = from !== "USD" && to === "USD";
		const isCrossRate = from !== "USD" && to !== "USD";
		const isSameExchange = from === to;
		const today = new Date().toISOString();

		let response = {};

		if (isSameExchange) {
			response = {
				date: today,
				from,
				to,
				rate: "1",
				inverse_rate: "1",
			} satisfies ExchangeRateSchema;
		} else if (isCrossRate) {
			// cross-rate exchange
			// ex: VND -> SGD || SGD -> VND
			const crossRate = await exchangeRateRepository.crossRate([from, to]);
			if (!crossRate) {
				return c.json({ message: "Exchange rate not found" }, HTTPStatus.codes.NOT_FOUND);
			}
			response = {
				date: today,
				from,
				to,
				rate: crossRate.exchangeRate,
				inverse_rate: crossRate.inverseRate,
			} satisfies ExchangeRateSchema;
		} else {
			// direct exchange
			// ex: VND -> USD || USD -> VND
			const queryData = await exchangeRateRepository.find({ from, to: to });
			if (!queryData) {
				return c.json({ message: "Exchange rate not found" }, HTTPStatus.codes.NOT_FOUND);
			}
			response = {
				date: today,
				from,
				to,
				rate: useInverse ? queryData.inverseRate : queryData.exchangeRate,
				inverse_rate: useInverse ? queryData.exchangeRate : queryData.inverseRate,
			} satisfies ExchangeRateSchema;
		}

		const parsed = ExchangeRateSchema(response);
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
