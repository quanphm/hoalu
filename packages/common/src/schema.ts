import * as z from "zod";

import {
	PG_ENUM_COLOR,
	PG_ENUM_PRIORITY,
	PG_ENUM_REPEAT,
	PG_ENUM_TASK_STATUS,
	PG_ENUM_WALLET_TYPE,
} from "#common/enums.ts";

export const ColorSchema = z.enum(PG_ENUM_COLOR);
export type ColorSchema = z.infer<typeof ColorSchema>;

export const TaskStatusSchema = z.enum(PG_ENUM_TASK_STATUS);
export type TaskStatusSchema = z.infer<typeof TaskStatusSchema>;

export const PrioritySchema = z.enum(PG_ENUM_PRIORITY);
export type PrioritySchema = z.infer<typeof PrioritySchema>;

export const RepeatSchema = z.enum(PG_ENUM_REPEAT);
export type RepeatSchema = z.infer<typeof RepeatSchema>;

export const WalletTypeSchema = z.enum(PG_ENUM_WALLET_TYPE);
export type WalletTypeSchema = z.infer<typeof WalletTypeSchema>;

export const CurrencySchema = z.string().length(3);
export type CurrencySchema = z.infer<typeof CurrencySchema>;

/**
 * Consolidate date/timestamp with `mode: string` from drizzle-orm & openapi.
 * Convert everything to 8601 ISO string.
 */
export const IsoDateSchema = z.string().transform((d) => new Date(d).toISOString());
export type IsoDateSchema = z.infer<typeof IsoDateSchema>;
