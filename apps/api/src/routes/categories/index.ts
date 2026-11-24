import { OpenAPI } from "@hoalu/furnace";
import { HTTPStatus } from "@hoalu/http/http-status";
import { createIssueMsg } from "@hoalu/http/standard-validate";
import { generateId } from "@hoalu/ids/generate-id";
import { tryCatch } from "@hoalu/stdlib/try-catch";
import { describeRoute } from "hono-openapi";
import * as z from "zod";

import { db } from "#api/db/index.ts";
import { createHonoInstance } from "#api/lib/create-app.ts";
import { currentXactId } from "#api/lib/xact-id.ts";
import { workspaceMember } from "#api/middlewares/workspace-member.ts";
import { CategoryRepository } from "#api/routes/categories/repository.ts";
import {
	CategoriesSchema,
	CategorySchema,
	DeleteCategorySchema,
	InsertCategorySchema,
	LiteCategorySchema,
	UpdateCategorySchema,
} from "#api/routes/categories/schema.ts";
import { idParamValidator } from "#api/validators/id-param.ts";
import { jsonBodyValidator } from "#api/validators/json-body.ts";
import { workspaceQueryValidator } from "#api/validators/workspace-query.ts";

const app = createHonoInstance();
const categoryRepository = new CategoryRepository();
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
				...OpenAPI.response(z.object({ data: CategoriesSchema }), HTTPStatus.codes.OK),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const typeParam = c.req.query("type") as "expense" | "income" | undefined;

			const categories = await categoryRepository.findAllByWorkspaceId({
				workspaceId: workspace.id,
				type: typeParam,
			});

			const parsed = CategoriesSchema.safeParse(categories);
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
			summary: "Get a single category",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.not_found(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: CategorySchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const param = c.req.valid("param");

			const category = await categoryRepository.findOne({
				id: param.id,
				workspaceId: workspace.id,
			});
			if (!category) {
				return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
			}

			const parsed = CategorySchema.safeParse(category);
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
			summary: "Create a new category",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.not_found(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: LiteCategorySchema }), HTTPStatus.codes.CREATED),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		jsonBodyValidator(InsertCategorySchema),
		async (c) => {
			const workspace = c.get("workspace");
			const payload = c.req.valid("json");
			// `category` has no `public_id` column: the client may still send one for a
			// uniform create payload, so it is accepted here and dropped.
			const { id, publicId: _publicId, ...rest } = payload;
			const categoryId = id ?? generateId({ use: "uuid" });

			const result = await tryCatch.async(
				db.transaction(async (tx) => {
					const inserted = await categoryRepository.insert(
						{
							...rest,
							id: categoryId,
							workspaceId: workspace.id,
						},
						tx,
					);

					const row =
						inserted ??
						(await categoryRepository.findOne({ id: categoryId, workspaceId: workspace.id }, tx));

					return { row, txid: await currentXactId(tx) };
				}),
			);

			if (result.error) {
				return c.json({ message: "Create failed" }, HTTPStatus.codes.BAD_REQUEST);
			}

			const category = result.data.row;
			if (!category) {
				return c.json({ message: "Create failed" }, HTTPStatus.codes.BAD_REQUEST);
			}

			const parsed = LiteCategorySchema.safeParse({ ...category, txid: result.data.txid });
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
			summary: "Update a category",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.not_found(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: LiteCategorySchema }), HTTPStatus.codes.OK),
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

			const category = await categoryRepository.findOne({
				id: param.id,
				workspaceId: workspace.id,
			});
			if (!category) {
				return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
			}

			const result = await tryCatch.async(
				db.transaction(async (tx) => {
					const updated = await categoryRepository.update(
						{
							id: param.id,
							workspaceId: workspace.id,
							payload,
						},
						tx,
					);

					return { updated, txid: await currentXactId(tx) };
				}),
			);

			if (result.error || !result.data.updated) {
				return c.json({ message: "Update failed" }, HTTPStatus.codes.BAD_REQUEST);
			}

			const parsed = LiteCategorySchema.safeParse({
				...result.data.updated,
				txid: result.data.txid,
			});
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
			summary: "Delete a category",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: DeleteCategorySchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const param = c.req.valid("param");

			const result = await tryCatch.async(
				db.transaction(async (tx) => {
					await categoryRepository.delete({ id: param.id, workspaceId: workspace.id }, tx);
					return currentXactId(tx);
				}),
			);

			if (result.error) {
				return c.json({ message: "Delete failed" }, HTTPStatus.codes.BAD_REQUEST);
			}

			const parsed = DeleteCategorySchema.safeParse({ id: param.id, txid: result.data });
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
