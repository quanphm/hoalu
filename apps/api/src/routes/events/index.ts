import { createHonoInstance } from "#api/lib/create-app.ts";
import { workspaceMember } from "#api/middlewares/workspace-member.ts";
import { EventRepository } from "#api/routes/events/repository.ts";
import {
	DeleteEventSchema,
	EventSchema,
	EventsSchema,
	InsertEventSchema,
	LiteEventSchema,
	UpdateEventSchema,
} from "#api/routes/events/schema.ts";
import { idParamValidator } from "#api/validators/id-param.ts";
import { jsonBodyValidator } from "#api/validators/json-body.ts";
import { workspaceQueryValidator } from "#api/validators/workspace-query.ts";
import { generateId } from "@hoalu/common/generate-id";
import { HTTPStatus } from "@hoalu/common/http-status";
import { monetary } from "@hoalu/common/monetary";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import { OpenAPI } from "@hoalu/furnace";
import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import * as z from "zod";

const app = createHonoInstance();
const repository = new EventRepository();
const TAGS = ["Events"];

const route = app
	.get(
		"/",
		describeRoute({
			tags: TAGS,
			summary: "Get all events",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: EventsSchema }), HTTPStatus.codes.OK),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");

			const events = await repository.findAllByWorkspaceId({ workspaceId: workspace.id });

			const parsed = EventsSchema.safeParse(events);
			if (!parsed.success) {
				return c.json(
					{ message: createIssueMsg(parsed.error.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}
			return c.json({ data: parsed.data }, HTTPStatus.codes.OK);
		},
	)
	.get(
		"/:id",
		describeRoute({
			tags: TAGS,
			summary: "Get a single event",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.not_found(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: EventSchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const { id } = c.req.valid("param");

			const event = await repository.findOne({ id, workspaceId: workspace.id });
			if (!event) {
				return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
			}

			const parsed = EventSchema.safeParse(event);
			if (!parsed.success) {
				return c.json(
					{ message: createIssueMsg(parsed.error.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed.data }, HTTPStatus.codes.OK);
		},
	)
	.post(
		"/",
		describeRoute({
			tags: TAGS,
			summary: "Create a new event",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: LiteEventSchema }), HTTPStatus.codes.CREATED),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		jsonBodyValidator(InsertEventSchema),
		async (c) => {
			const user = c.get("user");
			if (!user) {
				throw new HTTPException(HTTPStatus.codes.UNAUTHORIZED, {
					message: HTTPStatus.phrases.UNAUTHORIZED,
				});
			}
			const workspace = c.get("workspace");
			const payload = c.req.valid("json");
			const { budget, currency, ...rest } = payload;

			// Default budgetCurrency to workspace currency if not provided
			const realAmount = budget && currency ? monetary.toRealAmount(budget, currency) : null;
			const workspaceCurrency = (workspace.metadata?.currency as string) ?? "USD";

			const event = await repository.insert({
				...rest,
				id: generateId({ use: "uuid" }),
				publicId: generateId({ use: "nanoid", kind: "event" }),
				workspaceId: workspace.id,
				creatorId: user.id,
				budget: realAmount ? `${realAmount}` : null,
				currency: currency ?? workspaceCurrency,
			});

			if (!event) {
				return c.json({ message: "Create failed" }, HTTPStatus.codes.BAD_REQUEST);
			}

			const parsed = LiteEventSchema.safeParse(event);
			if (!parsed.success) {
				return c.json(
					{ message: createIssueMsg(parsed.error.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed.data }, HTTPStatus.codes.CREATED);
		},
	)
	.patch(
		"/:id",
		describeRoute({
			tags: TAGS,
			summary: "Update an event",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.not_found(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: LiteEventSchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		jsonBodyValidator(UpdateEventSchema),
		async (c) => {
			const workspace = c.get("workspace");
			const { id } = c.req.valid("param");
			const payload = c.req.valid("json");

			const existing = await repository.findOne({ id, workspaceId: workspace.id });
			if (!existing) {
				return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
			}

			const updatePayload: Record<string, unknown> = {};
			if (payload.title !== undefined) {
				updatePayload.title = payload.title;
			}
			if (payload.description !== undefined) {
				updatePayload.description = payload.description;
			}
			if (payload.startDate !== undefined) {
				updatePayload.startDate = payload.startDate ? payload.startDate : null;
			}
			if (payload.endDate !== undefined) {
				updatePayload.endDate = payload.endDate ? payload.endDate : null;
			}
			if (payload.currency !== undefined) {
				updatePayload.currency = payload.currency;
			}
			if (payload.budget !== undefined) {
				updatePayload.budget =
					payload.budget != null
						? monetary.fromRealAmount(payload.budget, payload.currency ?? existing.currency)
						: null;
			}
			if (payload.status !== undefined) {
				updatePayload.status = payload.status;
			}

			const event = await repository.update({
				id,
				workspaceId: workspace.id,
				payload: updatePayload,
			});
			if (!event) {
				return c.json({ message: "Update failed" }, HTTPStatus.codes.BAD_REQUEST);
			}

			const parsed = LiteEventSchema.safeParse(event);
			if (!parsed.success) {
				return c.json(
					{ message: createIssueMsg(parsed.error.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed.data }, HTTPStatus.codes.OK);
		},
	)
	.delete(
		"/:id",
		describeRoute({
			tags: TAGS,
			summary: "Delete an event",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.not_found(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: DeleteEventSchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const { id } = c.req.valid("param");

			const existing = await repository.findOne({ id, workspaceId: workspace.id });
			if (!existing) {
				return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
			}

			const result = await repository.delete({ id, workspaceId: workspace.id });

			const parsed = DeleteEventSchema.safeParse(result);
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
