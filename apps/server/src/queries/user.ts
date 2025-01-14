import { db } from "@/db";
import { user } from "@/db/schema/auth";
import * as v from "valibot";

export const AllUsersSchema = v.array(
	v.object({
		id: v.number(),
		email: v.string(),
		name: v.string(),
		public_id: v.string(),
	}),
);

export async function selectAllUsers() {
	const result = await db
		.select({
			id: user.id,
			public_id: user.publicId,
			name: user.name,
			email: user.email,
		})
		.from(user);

	const parsed = v.parse(AllUsersSchema, result);

	return parsed;
}
