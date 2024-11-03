import { db } from "@/lib/database";
import { userTable } from "@/lib/database/schema";
import { newId } from "@/utils/id";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";

const addUser = createServerFn("POST", async (name: string) => {
	await db.insert(userTable).values({
		id: newId("user"),
		username: name,
		email: name + "@mail.com",
	});
});

export const Route = createFileRoute("/")({
	component: Home,
	loader: async () => {
		const users = await db.select().from(userTable);
		return users;
	},
});

function Home() {
	const router = useRouter();
	const state = Route.useLoaderData();
	console.log(state);

	return (
		<div>
			<button
				type="button"
				onClick={() => {
					addUser("quan").then(() => {
						router.invalidate();
					});
				}}
			>
				Add user
			</button>

			{state.users.map((user) => {
				return <p key={user.id}>{user.username}</p>;
			})}
		</div>
	);
}
