import { index, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const workspace = pgTable(
	"workspace",
	{
		id: uuid("id").primaryKey(),
		slug: text("slug").notNull().unique(),
		publicId: text("public_id").notNull().unique(),
		name: text("name").notNull(),
		logo: text("logo"),
		createdAt: timestamp("created_at").notNull(),
		metadata: text("metadata"),
	},
	(table) => [index("idx_workspace_on_name").on(table.name)],
);

export const member = pgTable(
	"member",
	{
		id: uuid("id").primaryKey(),
		workspaceId: uuid("workspace_id")
			.notNull()
			.references(() => workspace.id, { onDelete: "cascade" }),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		role: text("role").notNull(),
		createdAt: timestamp("created_at").notNull(),
	},
	(table) => [unique("member_on_workspace_id_user_id_unique").on(table.workspaceId, table.userId)],
);

export const invitation = pgTable("invitation", {
	id: uuid("id").primaryKey(),
	email: text("email").notNull(),
	role: text("role"),
	status: text("status").notNull(),
	workspaceId: uuid("workspace_id")
		.notNull()
		.references(() => workspace.id, { onDelete: "cascade" }),
	inviterId: uuid("inviter_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	expiresAt: timestamp("expires_at").notNull(),
});
