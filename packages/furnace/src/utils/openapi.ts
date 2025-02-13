import { HTTPStatus } from "@hoalu/common/http-status";
import { type Type, type } from "arktype";
import type { ResolverResult } from "hono-openapi";
import { resolver } from "hono-openapi/arktype";

interface Response {
	description: string;
	content: {
		"application/json": {
			schema: ResolverResult;
		};
	};
}

/**
 * General response. Mostly use for `200`, `201` & `204` response.
 */
function response<T extends Type>(
	schema: T,
	status: number,
	description?: string,
): Record<number, Response> {
	return {
		[status]: {
			content: {
				"application/json": {
					schema: resolver<T>(schema),
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
						type({
							message: `'${HTTPStatus.phrases.UNAUTHORIZED}'`,
						}),
					),
				},
			},
			description: HTTPStatus.phrases.UNAUTHORIZED,
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
						type({
							message: `'string = ${HTTPStatus.phrases.BAD_REQUEST}'`,
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

function server_parse_error(description?: string): Record<422, Response> {
	return {
		[HTTPStatus.codes.UNPROCESSABLE_ENTITY]: {
			content: {
				"application/json": {
					schema: resolver(
						type({
							message: `'string = ${HTTPStatus.phrases.UNPROCESSABLE_ENTITY}'`,
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
	server_parse_error,
	response,
};
