import { apiKeyClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { workspaceClient } from "@hoalu/auth/client/plugins";

const authClient = createAuthClient({
	baseURL: `${import.meta.env.PUBLIC_API_URL}/auth`,
	plugins: [workspaceClient(), apiKeyClient()],
});

type AuthClientInfer = typeof authClient.$Infer;
type SessionData = AuthClientInfer["Session"];
type User = AuthClientInfer["Session"]["user"] & { publicId: string };
type Session = AuthClientInfer["Session"]["session"];

export { authClient };
export type { User, Session, SessionData };
