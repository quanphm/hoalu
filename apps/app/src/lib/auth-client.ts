import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: `${import.meta.env.PUBLIC_API_URL}/auth`,
	plugins: [organizationClient()],
});

export type AuthClient = typeof authClient;
