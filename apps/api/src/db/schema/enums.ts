import {
	PG_ENUM_COLOR,
	PG_ENUM_PRIORITY,
	PG_ENUM_REPEAT,
	PG_ENUM_TASK_STATUS,
	PG_ENUM_WALLET_TYPE,
} from "@hoalu/common/enums";
import { pgEnum } from "drizzle-orm/pg-core";

export const colorTypeEnum = pgEnum("color_enum", PG_ENUM_COLOR);
export const walletTypeEnum = pgEnum("wallet_type_enum", PG_ENUM_WALLET_TYPE);
export const priorityEnum = pgEnum("priority_enum", PG_ENUM_PRIORITY);
export const taskStatusEnum = pgEnum("task_status_enum", PG_ENUM_TASK_STATUS);
export const repeatEnum = pgEnum("repeat_enum", PG_ENUM_REPEAT);
