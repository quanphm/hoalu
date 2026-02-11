import { IsoDateSchema, PrioritySchema, TaskStatusSchema } from "@hoalu/common/schema";
import * as z from "zod";

export const TaskSchema = z.object({
	id: z.uuidv7(),
	title: z.string(),
	description: z.string().nullable(),
	creatorId: z.uuidv7(),
	workspaceId: z.uuidv7(),
	status: TaskStatusSchema,
	priority: PrioritySchema,
	createdAt: IsoDateSchema,
	dueDate: IsoDateSchema,
});

export const TasksSchema = z.array(TaskSchema);

export const InsertTaskSchema = z.object({
	title: z.string().min(1),
	description: z.optional(z.string()),
	status: TaskStatusSchema.default("todo"),
	priority: PrioritySchema.default("none"),
	dueDate: z.optional(z.iso.datetime()),
});

export const UpdateTaskSchema = InsertTaskSchema.partial();

export const DeleteTaskSchema = z.object({
	id: z.uuidv7(),
});
