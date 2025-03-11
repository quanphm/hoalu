import { HTTPStatus } from "@hoalu/common/http-status";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import { OpenAPI } from "@hoalu/furnace";
import { type } from "arktype";
import { describeRoute } from "hono-openapi";
import { validator as aValidator } from "hono-openapi/arktype";
import { createHonoInstance } from "../../lib/create-app";
import { ExchangeRateRepository } from "./repository";
import { exchangeRateSchema } from "./schema";

type ExchangeRateSchema = typeof exchangeRateSchema.in.infer;

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
		const from = query.from || "USD";

		const useInverse = from !== "USD" && query.to === "USD";
		const isCrossRate = from !== "USD" && query.to !== "USD";
		const isSameExchange = from === query.to;

		let response = {};

		if (isSameExchange) {
			response = {
				date: new Date().toISOString(),
				from: from,
				to: query.to,
				rate: "1",
				inverse_rate: "1",
			} satisfies ExchangeRateSchema;
		} else if (isCrossRate) {
			// cross-rate exchange
			// ex: VND -> SGD || SGD -> VND
			const crossRate = await exchangeRateRepository.crossRate([from, query.to]);
			if (!crossRate) {
				return c.json({ message: "Exchange rate not found" }, HTTPStatus.codes.NOT_FOUND);
			}
			response = {
				date: new Date().toISOString(),
				from: crossRate.fromCurrency,
				to: crossRate.toCurrency,
				rate: crossRate.exchangeRate,
				inverse_rate: crossRate.inverseRate,
			} satisfies ExchangeRateSchema;
		} else {
			// direct exchange
			// ex: VND -> USD || USD -> VND
			const queryData = await exchangeRateRepository.find({ from, to: query.to });
			if (!queryData) {
				return c.json({ message: "Exchange rate not found" }, HTTPStatus.codes.NOT_FOUND);
			}
			response = {
				date: new Date().toISOString(),
				from: queryData.fromCurrency,
				to: queryData.toCurrency,
				rate: useInverse ? queryData.inverseRate : queryData.exchangeRate,
				inverse_rate: useInverse ? queryData.exchangeRate : queryData.inverseRate,
			} satisfies ExchangeRateSchema;
		}

		const parsed = exchangeRateSchema(response);
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
