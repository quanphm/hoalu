import { HTTPStatus } from "@hoalu/common/http-status";
import type { ResolverResult } from "hono-openapi";
import { resolver } from "hono-openapi/valibot";
import type { BaseIssue, BaseSchema } from "valibot";
import * as v from "valibot";

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
function response<T extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
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
						v.object({
							message: v.literal(HTTPStatus.phrases.UNAUTHORIZED),
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
						v.object({
							error: v.array(
								v.object({
									attribute: v.undefinedable(v.string()),
									message: v.optional(v.string(), HTTPStatus.phrases.BAD_REQUEST),
								}),
							),
						}),
					),
				},
			},
			description: description || "Invalid request body",
		},
	};
}

/**
 * For some reasons, valibot couldn't parse the database result correctly.
 */
function server_parse_error(description?: string): Record<422, Response> {
	return {
		[HTTPStatus.codes.UNPROCESSABLE_ENTITY]: {
			content: {
				"application/json": {
					schema: resolver(
						v.object({
							error: v.array(
								v.object({
									attribute: v.undefinedable(v.string()),
									message: v.optional(v.string(), HTTPStatus.phrases.UNPROCESSABLE_ENTITY),
								}),
							),
						}),
					),
				},
			},
			description: description || "Server validation/parse errors",
		},
	};
}

export const OpenAPI = {
	unauthorized,
	bad_request,
	server_parse_error,
	response,
};
