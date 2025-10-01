import { type } from "arktype";
import { describeRoute } from "hono-openapi";

import { generateId } from "@hoalu/common/generate-id";
import { HTTPStatus } from "@hoalu/common/http-status";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import { OpenAPI } from "@hoalu/furnace";
import { createHonoInstance } from "../../lib/create-app";
import { workspaceMember } from "../../middlewares/workspace-member";
import { idParamValidator } from "../../validators/id-param";
import { jsonBodyValidator } from "../../validators/json-body";
import { workspaceQueryValidator } from "../../validators/workspace-query";
import { CategoryRepository } from "./repository";
import {
	CategoriesSchema,
	CategorySchema,
	DeleteCategorySchema,
	InsertCategorySchema,
	LiteCategorySchema,
	UpdateCategorySchema,
} from "./schema";

const app = createHonoInstance();
const catgegoryRepository = new CategoryRepository();
const TAGS = ["Categories"];

const route = app
	.get(
		"/",
		describeRoute({
			tags: TAGS,
			summary: "Get all categories",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: CategoriesSchema }), HTTPStatus.codes.OK),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");

			const categories = await catgegoryRepository.findAllByWorkspaceId({
				workspaceId: workspace.id,
			});

			const parsed = CategoriesSchema(categories);
			if (parsed instanceof type.errors) {
				return c.json(
					{ message: createIssueMsg(parsed.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed }, HTTPStatus.codes.OK);
		},
	)
	.get(
		"/:id",
		describeRoute({
			tags: TAGS,
			summary: "Get a single category",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.not_found(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: CategorySchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const param = c.req.valid("param");

			const category = await catgegoryRepository.findOne({
				id: param.id,
				workspaceId: workspace.id,
			});
			if (!category) {
				return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
			}

			const parsed = CategorySchema(category);
			if (parsed instanceof type.errors) {
				return c.json(
					{ message: createIssueMsg(parsed.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed }, HTTPStatus.codes.OK);
		},
	)
	.post(
		"/",
		describeRoute({
			tags: TAGS,
			summary: "Create a new category",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.not_found(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: CategorySchema }), HTTPStatus.codes.CREATED),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		jsonBodyValidator(InsertCategorySchema),
		async (c) => {
			const workspace = c.get("workspace");
			const payload = c.req.valid("json");

			const category = await catgegoryRepository.insert({
				...payload,
				id: generateId({ use: "uuid" }),
				workspaceId: workspace.id,
			});

			const parsed = LiteCategorySchema(category);
			if (parsed instanceof type.errors) {
				return c.json(
					{ message: createIssueMsg(parsed.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed }, HTTPStatus.codes.CREATED);
		},
	)
	.patch(
		"/:id",
		describeRoute({
			tags: TAGS,
			summary: "Update a category",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.not_found(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: CategorySchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		jsonBodyValidator(UpdateCategorySchema),
		async (c) => {
			const workspace = c.get("workspace");
			const param = c.req.valid("param");
			const payload = c.req.valid("json");

			const category = await catgegoryRepository.findOne({
				id: param.id,
				workspaceId: workspace.id,
			});
			if (!category) {
				return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
			}

			const queryData = await catgegoryRepository.update({
				id: param.id,
				workspaceId: workspace.id,
				payload,
			});
			if (!queryData) {
				return c.json({ message: "Update operation failed" }, HTTPStatus.codes.BAD_REQUEST);
			}

			const parsed = LiteCategorySchema(queryData);
			if (parsed instanceof type.errors) {
				return c.json(
					{ message: createIssueMsg(parsed.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed }, HTTPStatus.codes.OK);
		},
	)
	.delete(
		"/:id",
		describeRoute({
			tags: TAGS,
			summary: "Delete a category",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: DeleteCategorySchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const param = c.req.valid("param");

			const category = await catgegoryRepository.delete({
				id: param.id,
				workspaceId: workspace.id,
			});

			const parsed = DeleteCategorySchema(category);
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
