import { type } from "arktype";

export const prioritySchema = type("'urgent' | 'high' | 'medium' | 'low' | 'none'");

export const taskSchema = type({
	"+": "delete",
	id: "string",
	name: "string",
	done: "boolean",
	priority: prioritySchema,
	creatorId: "string",
	workspaceId: "string",
	createdAt: "string",
	dueDate: "string",
});

export const tasksSchema = taskSchema.array().onUndeclaredKey("delete");

export const insertTaskSchema = type({
	name: "string > 0",
	done: "boolean = false",
	"priority?": prioritySchema,
	"dueDate?": "string",
});

export const updateTaskSchema = insertTaskSchema.partial();
