import { type } from "arktype";

export const taskSchema = type({
	id: "string",
	name: "string",
	done: "boolean",
	creatorId: "string",
	workspaceId: "string",
	createdAt: "string",
	updatedAt: "string",
});

export const tasksSchema = taskSchema.array();

export const insertTaskSchema = type({
	name: "string > 0",
	done: "boolean = false",
});

export const updateTaskSchema = type({
	"name?": "string > 0",
	"done?": "boolean",
});

export const taskIdSchema = type({ id: "string.uuid" });
