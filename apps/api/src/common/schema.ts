import * as z from "zod";

import {
	PG_ENUM_COLOR,
	PG_ENUM_PRIORITY,
	PG_ENUM_REPEAT,
	PG_ENUM_TASK_STATUS,
	PG_ENUM_WALLET_TYPE,
} from "@hoalu/common/enums";

export const ColorSchema = z.enum(PG_ENUM_COLOR);
export const TaskStatusSchema = z.enum(PG_ENUM_TASK_STATUS);
export const PrioritySchema = z.enum(PG_ENUM_PRIORITY);
export const RepeatSchema = z.enum(PG_ENUM_REPEAT);
export const WalletTypeSchema = z.enum(PG_ENUM_WALLET_TYPE);
export const CurrencySchema = z.string().length(3);

/**
 * Consolidate date/timestamp with `mode: string` from drizzle-orm & openapi.
 * Convert everything to 8601 ISO string.
 */
export const IsoDateSchema = z.string().transform((d) => new Date(d).toISOString());

export type Color = z.infer<typeof ColorSchema>;
