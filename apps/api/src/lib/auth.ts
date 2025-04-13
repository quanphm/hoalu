import { userPublicId, workspace } from "@hoalu/auth/plugins";
import { generateId } from "@hoalu/common/generate-id";
import { TIME_IN_SECONDS } from "@hoalu/common/time";
import JoinWorkspace from "@hoalu/email/join-workspace";
import VerifyEmail from "@hoalu/email/verify-email";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { apiKey, jwt, openAPI } from "better-auth/plugins";
import { DEFAULT_CATEGORIES, WORKSPACE_CREATOR_ROLE } from "../common/constants";
import { db } from "../db";
import { category, wallet } from "../db/schema";
import { sendEmail } from "./email";

export const auth = betterAuth({
	baseURL: process.env.AUTH_URL,
	secret: process.env.AUTH_SECRET,
	basePath: "/auth",
	trustedOrigins: [process.env.PUBLIC_APP_BASE_URL],
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	advanced: {
		cookiePrefix: "hoalu",
		database: {
			generateId: () => {
				return generateId({ use: "uuid" });
			},
		},
	},
	session: {
		cookieCache: {
			enabled: true,
		},
		expiresIn: TIME_IN_SECONDS.DAY * 7, // 7 days
		updateAge: TIME_IN_SECONDS.DAY, // 1 day (every 1 day the session expiration is updated)
	},
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
		minPasswordLength: 5,
		password: {
			hash: async (password) => {
				return await Bun.password.hash(password, {
					algorithm: "argon2id",
					memoryCost: 19456,
					timeCost: 2,
				});
			},
			verify: async ({ password, hash }) => {
				return await Bun.password.verify(password, hash);
			},
		},
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, token }, _request) => {
			const url = new URL(`${process.env.PUBLIC_APP_BASE_URL}/verify-email`);
			url.searchParams.set("token", token);

			if (process.env.NODE_ENV === "development") {
				console.log("Verification Link:", url.href);
				return;
			}

			sendEmail({
				to: user.email,
				subject: "[Hoalu] Please verify your email address",
				react: VerifyEmail({ url: url.href, name: user.name }),
			});
		},
	},
	plugins: [
		userPublicId(),
		workspace({
			creatorRole: WORKSPACE_CREATOR_ROLE,
			sendInvitationEmail: async (data) => {
				const inviteLink = `${process.env.PUBLIC_APP_BASE_URL}/invite/${data.id}/accept`;

				if (process.env.NODE_ENV === "development") {
					console.log("Inviation Link:", inviteLink);
					return;
				}

				sendEmail({
					to: data.email,
					subject: `[Hoalu] ${data.inviter.user.name} invited you to ${data.workspace.name}`,
					react: JoinWorkspace({
						inviteLink,
						inviterName: data.inviter.user.name,
						workspaceName: data.workspace.name,
					}),
				});
			},
			workspaceCreation: {
				afterCreate: async (data) => {
					const { workspace, user } = data;
					const workspaceDefaultCurrency = workspace.metadata.currency;

					await db.transaction(async (tx) => {
						// default wallet
						await tx.insert(wallet).values({
							id: generateId({ use: "uuid" }),
							name: "Cash wallet",
							description: "Physical cash",
							workspaceId: workspace.id,
							ownerId: user.id,
							type: "cash",
							currency: workspaceDefaultCurrency ?? "USD",
						});
						// default categories
						await tx.insert(category).values(
							DEFAULT_CATEGORIES.map((c) => ({
								id: generateId({ use: "uuid" }),
								name: c.name,
								description: c.description,
								color: c.color,
								workspaceId: workspace.id,
							})),
						);
					});
				},
			},
		}),
		jwt({
			jwt: {
				definePayload: ({ user }) => {
					return {
						id: user.id,
						name: user.name,
						email: user.email,
					};
				},
				issuer: process.env.AUTH_URL,
				audience: process.env.PUBLIC_APP_BASE_URL,
				expirationTime: "30d",
			},
		}),
		apiKey(),
		openAPI(),
	],
});
