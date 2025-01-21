import { userPublicId, workspace } from "@woben/auth/plugins";
import VerificationEmail from "@woben/email/verification-email";
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
			const verificationUrl = new URL(`${process.env.PUBLIC_API_URL}/auth/verify-email`);
			verificationUrl.searchParams.set("token", token);
			verificationUrl.searchParams.set("callbackURL", process.env.PUBLIC_APP_BASE_URL);

			sendEmail({
				to: user.email,
				subject: "[Woben] Please verify your email address",
				react: VerificationEmail({ url: verificationUrl.href, name: user.name }),
			});
		},
	},
	plugins: [userPublicId(), workspace(), openAPI()],
});
