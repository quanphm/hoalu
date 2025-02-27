import { sql } from "drizzle-orm";
import { foreignKey, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { member } from "./workspace";

export const image = pgTable(
	"image",
	{
		id: uuid("id").primaryKey(),
		fileName: text("file_name").notNull(),
		s3Url: text("s3_url").notNull(),
		description: text("description"),
		tags: text("tags").array().default(sql`ARRAY[]::text[]`),
		userId: uuid("user_id"),
		workspaceId: uuid("workspace_id"),
		createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
	},
	(table) => [
		foreignKey({
			name: "image_member_fk",
			columns: [table.workspaceId, table.userId],
			foreignColumns: [member.workspaceId, member.userId],
		}).onDelete("set null"),
	],
);
