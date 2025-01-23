import { userPublicId, workspace } from "@hoalu/auth/plugins";
import VerificationEmail from "@hoalu/email/verification-email";
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
				react: VerificationEmail({ url: url.href, name: user.name }),
			});
		},
	},
	plugins: [userPublicId(), workspace(), openAPI()],
});
