import { useRouteContext } from "@tanstack/react-router";

export function User() {
	const context = useRouteContext({ from: "__root__" });
	const user = context.user;
	return <pre>{JSON.stringify(user, null, 2)}</pre>;
}
