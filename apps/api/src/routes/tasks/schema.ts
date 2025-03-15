import { type } from "arktype";
import { prioritySchema, taskStatusSchema } from "../../common/schema";

export const taskSchema = type({
	"+": "delete",
	id: "string.uuid.v7",
	title: "string",
	description: "string | null",
	status: taskStatusSchema,
	priority: prioritySchema,
	creatorId: "string.uuid.v7",
	workspaceId: "string.uuid.v7",
	createdAt: "string",
	dueDate: "string",
});

export const tasksSchema = taskSchema.array().onUndeclaredKey("delete");

export const insertTaskSchema = type({
	title: "string > 0",
	"description?": "string",
	status: taskStatusSchema.default("todo"),
	priority: prioritySchema.default("none"),
	"dueDate?": "string.date.iso",
});

export const updateTaskSchema = insertTaskSchema.partial();

export const deleteTaskSchema = type({
	"+": "delete",
	id: "string.uuid.v7",
}).or("null");
