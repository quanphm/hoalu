import { index, integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const workspace = pgTable(
	"workspace",
	{
		id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
		name: text("name").notNull(),
		slug: text("slug").notNull().unique(),
		publicId: text("public_id").notNull().unique(),
		logo: text("logo"),
		createdAt: timestamp("created_at").notNull(),
		metadata: text("metadata"),
	},
	(table) => [index("idx_workspace_name").on(table.name)],
);

export const member = pgTable(
	"member",
	{
		id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
		workspaceId: integer("workspace_id")
			.notNull()
			.references(() => workspace.id, { onDelete: "cascade" }),
		userId: integer("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		role: text("role").notNull(),
		createdAt: timestamp("created_at").notNull(),
	},
	// [TODO]: back to this later
	// (table) => [primaryKey({ columns: [table.workspaceId, table.userId] })],
);

export const invitation = pgTable("invitation", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	email: text("email").notNull(),
	role: text("role"),
	status: text("status").notNull(),
	workspaceId: integer("workspace_id")
		.notNull()
		.references(() => workspace.id, { onDelete: "cascade" }),
	inviterId: integer("inviter_id")
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp("expires_at").notNull(),
});
