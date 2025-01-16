import { db } from "@/db";
import { hash, verify } from "@node-rs/argon2";
import { userPublicId } from "@woben/furnace/auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
	baseURL: process.env.AUTH_URL,
	secret: process.env.AUTH_SECRET,
	basePath: "/auth",
	trustedOrigins: [process.env.PUBLIC_APP_BASE_URL!],
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
				return await hash(password, {
					memoryCost: 19456,
					timeCost: 2,
					outputLen: 32,
					parallelism: 1,
				});
			},
			verify: async ({ hash, password }) => {
				return await verify(hash, password);
			},
		},
	},
	plugins: [userPublicId()],
});
