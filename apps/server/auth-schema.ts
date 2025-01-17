import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
			
export const user = pgTable("user", {
					id: text("id").primaryKey(),
					name: text('name').notNull(),
 email: text('email').notNull().unique(),
 emailVerified: boolean('email_verified').notNull(),
 image: text('image'),
 createdAt: timestamp('created_at').notNull(),
 updatedAt: timestamp('updated_at').notNull(),
 publicId: text('public_id').unique()
				});

export const session = pgTable("session", {
					id: text("id").primaryKey(),
					expiresAt: timestamp('expires_at').notNull(),
 token: text('token').notNull().unique(),
 createdAt: timestamp('created_at').notNull(),
 updatedAt: timestamp('updated_at').notNull(),
 ipAddress: text('ip_address'),
 userAgent: text('user_agent'),
 userId: text('user_id').notNull().references(()=> user.id),
 activeOrganizationId: integer('active_organization_id')
				});

export const account = pgTable("account", {
					id: text("id").primaryKey(),
					accountId: text('account_id').notNull(),
 providerId: text('provider_id').notNull(),
 userId: text('user_id').notNull().references(()=> user.id),
 accessToken: text('access_token'),
 refreshToken: text('refresh_token'),
 idToken: text('id_token'),
 accessTokenExpiresAt: timestamp('access_token_expires_at'),
 refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
 scope: text('scope'),
 password: text('password'),
 createdAt: timestamp('created_at').notNull(),
 updatedAt: timestamp('updated_at').notNull()
				});

export const verification = pgTable("verification", {
					id: text("id").primaryKey(),
					identifier: text('identifier').notNull(),
 value: text('value').notNull(),
 expiresAt: timestamp('expires_at').notNull(),
 createdAt: timestamp('created_at'),
 updatedAt: timestamp('updated_at')
				});

export const workspace = pgTable("workspace", {
					id: text("id").primaryKey(),
					name: text('name').notNull(),
 slug: text('slug').unique(),
 publicId: text('public_id').notNull().unique(),
 logo: text('logo'),
 createdAt: timestamp('created_at').notNull(),
 metadata: text('metadata')
				});

export const member = pgTable("member", {
					id: text("id").primaryKey(),
					workspaceId: text('workspace_id').notNull().references(()=> workspace.id),
 userId: text('user_id').notNull().references(()=> user.id),
 role: text('role').notNull(),
 createdAt: timestamp('created_at').notNull()
				});

export const invitation = pgTable("invitation", {
					id: text("id").primaryKey(),
					workspaceId: text('workspace_id').notNull().references(()=> workspace.id),
 email: text('email').notNull(),
 role: text('role'),
 status: text('status').notNull(),
 expiresAt: timestamp('expires_at').notNull(),
 inviterId: text('inviter_id').notNull().references(()=> user.id)
				});
