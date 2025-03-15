import {
	PG_ENUM_COLOR,
	PG_ENUM_PRIORITY,
	PG_ENUM_REPEAT,
	PG_ENUM_TASK_STATUS,
	PG_ENUM_WALLET_TYPE,
} from "@hoalu/common/enums";
import { type } from "arktype";

export const colorSchema = type("===", ...PG_ENUM_COLOR);
export const taskStatusSchema = type("===", ...PG_ENUM_TASK_STATUS);
export const prioritySchema = type("===", ...PG_ENUM_PRIORITY);
export const repeatSchema = type("===", ...PG_ENUM_REPEAT);
export const walletTypeSchema = type("===", ...PG_ENUM_WALLET_TYPE);
export const isoDateSchema = type("string.date.iso");
export const currencySchema = type("string > 0").default("USD");

export type Color = typeof colorSchema.inferOut;
