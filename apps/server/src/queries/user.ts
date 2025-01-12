import { db } from "@/db";
import { userTable } from "@/db/schema";
import * as v from "valibot";

export const AllUsersSchema = v.array(
	v.object({
		id: v.number(),
		public_id: v.string(),
		email: v.string(),
		username: v.string(),
	}),
);

export async function selectAllUsers() {
	const result = await db
		.select({
			id: userTable.id,
			public_id: userTable.public_id,
			username: userTable.username,
			email: userTable.email,
		})
		.from(userTable);

	const parsed = v.parse(AllUsersSchema, result);

	return parsed;
}
