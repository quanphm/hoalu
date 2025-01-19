import { userPublicId, workspace } from "@woben/auth/plugins";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { db } from "../db";

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
		sendVerificationEmail: async ({ user, url, token }, request) => {
			await fetch("https://api.useplunk.com/v1/send", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.PLUNK_SECRET_KEY}`,
				},
				body: JSON.stringify({
					to: user.email,
					subject: "Verify your email address",
					body: `Click the link to verify your email: ${url}`,
				}),
			});
		},
	},
	plugins: [userPublicId(), workspace(), openAPI()],
});
