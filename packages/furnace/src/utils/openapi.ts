import { resolver } from "hono-openapi";
import * as z from "zod";

import { HTTPStatus } from "@hoalu/common/http-status";

interface Response {
	description: string;
	content: {
		"application/json": {
			schema: ReturnType<typeof resolver>;
		};
	};
}

/**
 * General response. Mostly use for `200`, `201` & `204` response.
 */
function response<T extends z.ZodObject>(
	schema: T,
	status: number,
	description?: string,
): Record<number, Response> {
	return {
		[status]: {
			content: {
				"application/json": {
					schema: resolver(schema),
				},
			},
			description: description || "Success",
		},
	};
}

function unauthorized(): Record<401, Response> {
	return {
		[HTTPStatus.codes.UNAUTHORIZED]: {
			content: {
				"application/json": {
					schema: resolver(
						z.object({
							message: z.string().default(HTTPStatus.phrases.UNAUTHORIZED),
						}),
					),
				},
			},
			description: "The client must authenticate itself to get the requested response.",
		},
	};
}

/**
 * Invalid body requerst from client.
 */
function bad_request(description?: string): Record<400, Response> {
	return {
		[HTTPStatus.codes.BAD_REQUEST]: {
			content: {
				"application/json": {
					schema: resolver(
						z.object({
							message: z.string().default(HTTPStatus.phrases.BAD_REQUEST),
						}),
					),
				},
			},
			description:
				description ||
				"The request is malformed, either missing required fields, using wrong datatypes, or being syntactically incorrect.",
		},
	};
}

/**
 * Resource not found.
 */
function not_found(description?: string): Record<404, Response> {
	return {
		[HTTPStatus.codes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: resolver(
						z.object({
							message: z.string().default(HTTPStatus.phrases.NOT_FOUND),
						}),
					),
				},
			},
			description: description || "The server cannot find the requested resource.",
		},
	};
}

function server_parse_error(description?: string): Record<422, Response> {
	return {
		[HTTPStatus.codes.UNPROCESSABLE_ENTITY]: {
			content: {
				"application/json": {
					schema: resolver(
						z.object({
							message: z.string().default(HTTPStatus.phrases.UNPROCESSABLE_ENTITY),
						}),
					),
				},
			},
			description:
				description ||
				"The server was unable to process the request because it contains invalid data.",
		},
	};
}

export const OpenAPI = {
	unauthorized,
	bad_request,
	not_found,
	server_parse_error,
	response,
};
