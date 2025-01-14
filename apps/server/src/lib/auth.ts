import { db } from "@/db";
import { userPublicId } from "@woben/furnace/auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
	baseURL: process.env.AUTH_URL,
	secret: process.env.AUTH_SECRET,
	basePath: "/auth",
	trustedOrigins: ["http://localhost:5173"],
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
			hash: (password) =>
				Bun.password.hash(password, {
					memoryCost: 12288,
					timeCost: 3,
					algorithm: "argon2id",
				}),
			verify: ({ hash, password }) => Bun.password.verify(hash, password),
		},
	},
	plugins: [userPublicId()],
});
