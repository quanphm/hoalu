import { userPublicId } from "@woben/furnace/auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
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
	plugins: [userPublicId(), organization()],
});
