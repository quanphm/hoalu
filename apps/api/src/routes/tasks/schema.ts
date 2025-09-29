import { type } from "arktype";

import { IsoDateSchema, PrioritySchema, TaskStatusSchema } from "../../common/schema";

export const TaskSchema = type({
	"+": "delete",
	id: "string.uuid.v7",
	title: "string",
	description: "string | null",
	status: TaskStatusSchema,
	priority: PrioritySchema,
	creatorId: "string.uuid.v7",
	workspaceId: "string.uuid.v7",
	createdAt: IsoDateSchema,
	dueDate: IsoDateSchema,
});

export const TasksSchema = TaskSchema.array().onUndeclaredKey("delete");

export const InsertTaskSchema = type({
	title: "string > 0",
	"description?": "string",
	status: TaskStatusSchema.default("todo"),
	priority: PrioritySchema.default("none"),
	"dueDate?": "string.date.iso",
});

export const UpdateTaskSchema = InsertTaskSchema.partial();

export const DeleteTaskSchema = type({
	id: "string.uuid.v7",
});
