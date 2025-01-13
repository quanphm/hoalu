import { db } from "@/db";
import { generateId } from "@woben/common";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	user: {
		additionalFields: {
			public_id: {
				type: "string",
				required: true,
				defaultValue: generateId("user"),
				input: false,
			},
		},
	},
	advanced: {
		generateId: false,
	},
	emailAndPassword: {
		enabled: true,
	},
});
