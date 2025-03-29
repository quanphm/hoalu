import { type } from "arktype";
import { isoDateSchema, prioritySchema, taskStatusSchema } from "../../common/schema";

export const TaskSchema = type({
	"+": "delete",
	id: "string.uuid.v7",
	title: "string",
	description: "string | null",
	status: taskStatusSchema,
	priority: prioritySchema,
	creatorId: "string.uuid.v7",
	workspaceId: "string.uuid.v7",
	createdAt: isoDateSchema,
	dueDate: isoDateSchema,
});

export const TasksSchema = TaskSchema.array().onUndeclaredKey("delete");

export const InsertTaskSchema = type({
	title: "string > 0",
	"description?": "string",
	status: taskStatusSchema.default("todo"),
	priority: prioritySchema.default("none"),
	"dueDate?": "string.date.iso",
});

export const UpdateTaskSchema = InsertTaskSchema.partial();

export const DeleteTaskSchema = type({
	"+": "delete",
	id: "string.uuid.v7",
}).or("null");
