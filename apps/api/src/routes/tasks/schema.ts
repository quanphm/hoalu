import { type } from "arktype";
import { prioritySchema, taskStatusSchema } from "../../common";

export const taskSchema = type({
	"+": "delete",
	id: "string",
	title: "string",
	description: "string | null",
	status: taskStatusSchema,
	priority: prioritySchema,
	creatorId: "string",
	workspaceId: "string",
	createdAt: "string",
	dueDate: "string",
});

export const tasksSchema = taskSchema.array().onUndeclaredKey("delete");

export const insertTaskSchema = type({
	title: "string > 0",
	"description?": "string",
	status: taskStatusSchema.default("todo"),
	"priority?": prioritySchema,
	"dueDate?": "string",
});

export const updateTaskSchema = insertTaskSchema.partial();

export const deleteTaskSchema = type({
	"+": "delete",
	id: "string",
}).or("null");
