import type { ResolverResult } from "hono-openapi";
import { resolver } from "hono-openapi/valibot";
import type { BaseIssue, BaseSchema } from "valibot";
import * as v from "valibot";
import { UNAUTHORIZED as UnauthorizedCode } from "./http-status-codes";
import { UNAUTHORIZED as UnauthorizedPhrase } from "./http-status-phrases";

interface OpenAPIContent {
	description: string;
	content: {
		"application/json": {
			schema: ResolverResult;
		};
	};
}

export function openAPIContent<T extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
	schema: T,
	description: string,
): OpenAPIContent {
	return {
		content: {
			"application/json": {
				schema: resolver<T>(schema),
			},
		},
		description,
	};
}

export function openAPIUnauthorized() {
	return {
		[UnauthorizedCode]: {
			content: {
				"application/json": {
					schema: resolver(
						v.object({
							message: v.literal(UnauthorizedPhrase),
						}),
					),
				},
			},
			description: UnauthorizedPhrase,
		},
	};
}
