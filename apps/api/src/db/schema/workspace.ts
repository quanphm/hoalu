import { generateId } from "@hoalu/common/generate-id";
import { bigint, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const workspace = pgTable(
	"workspace",
	{
		id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
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
		id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
		workspaceId: bigint("workspace_id", { mode: "number" })
			.notNull()
			.references(() => workspace.id, { onDelete: "cascade" }),
		userId: bigint("user_id", { mode: "number" })
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		role: text("role").notNull(),
		createdAt: timestamp("created_at").notNull(),
	},
	// (table) => [primaryKey({ columns: [table.workspaceId, table.userId] })],
);

export const invitation = pgTable("invitation", {
	id: uuid("id").primaryKey(),
	email: text("email").notNull(),
	role: text("role"),
	status: text("status").notNull(),
	workspaceId: bigint("workspace_id", { mode: "number" })
		.notNull()
		.references(() => workspace.id, { onDelete: "cascade" }),
	inviterId: bigint("inviter_id", { mode: "number" })
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp("expires_at").notNull(),
});
