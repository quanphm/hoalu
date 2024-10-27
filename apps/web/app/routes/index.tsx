import { db } from "@/lib/database";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import axios from "axios";

const addUser = createServerFn("POST", async (name: string) => {
	await db.api
		.insertInto("user")
		.values({
			id: "123",
			username: name,
			email: name + "@mail.com",
		})
		.returningAll()
		.executeTakeFirstOrThrow();
});

export const Route = createFileRoute("/")({
	component: Home,
	loader: async () => {
		const result = await axios.get("http://localhost:3000/api/users");
		return result.data;
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

			{state.data.map((user) => {
				return <p key={user.id}>{user.username}</p>;
			})}
		</div>
	);
}
