import { db } from "@/db";
import { userTable } from "@/db/schema/auth";
import * as v from "valibot";

export const AllUsersSchema = v.array(
	v.object({
		id: v.number(),
		email: v.string(),
		name: v.string(),
	}),
);

export async function selectAllUsers() {
	const result = await db
		.select({
			id: userTable.id,
			// public_id: userTable.public_id,
			name: userTable.name,
			email: userTable.email,
		})
		.from(userTable);

	const parsed = v.parse(AllUsersSchema, result);

	return parsed;
}
