import { useAuth } from "@/hooks/useAuth";

export function User() {
	const { user, authClient } = useAuth();
	const { data: workspace } = authClient.useActiveWorkspace();

	return (
		<div>
			<pre>{JSON.stringify(user, null, 2)}</pre>
			<pre>{JSON.stringify(workspace, null, 2)}</pre>
		</div>
	);
}
