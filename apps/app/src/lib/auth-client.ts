import { workspaceClient } from "@woben/auth/client/plugins";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: `${import.meta.env.PUBLIC_API_URL}/auth`,
	plugins: [workspaceClient(), organizationClient()],
});

export type AuthClient = typeof authClient;

authClient.organization.create({
	name: "test",
	slug: "test",
});

authClient.workspace.create({
	name: "test",
	slug: "test",
});
