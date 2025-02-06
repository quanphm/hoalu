import { userPublicId, workspace } from "@hoalu/auth/plugins";
import JoinWorkspace from "@hoalu/email/join-workspace";
import VerifyEmail from "@hoalu/email/verify-email";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { db } from "../db";
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
		generateId: false,
	},
	session: {
		cookieCache: {
			enabled: true,
		},
	},
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
		minPasswordLength: 6,
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
			const url = new URL(`${process.env.PUBLIC_API_URL}/auth/verify-email`);
			url.searchParams.set("token", token);
			url.searchParams.set("callbackURL", process.env.PUBLIC_APP_BASE_URL);

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
		}),
		openAPI(),
	],
});
