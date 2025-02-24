import { WORKSPACE_ERROR_CODES } from "@hoalu/auth/plugins";
import { HTTPStatus } from "@hoalu/common/http-status";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { db } from "../db";
import type { AppBindings } from "../types";

interface Workspace {
	id: string;
	publicId: string;
	name: string;
	createdAt: Date;
	slug: string;
	logo: string | null;
	metadata: string | null;
}

interface Member {
	id: string;
	createdAt: Date;
	userId: string;
	workspaceId: string;
	role: string;
}

export const workspaceMember = createMiddleware<
	AppBindings & {
		Variables: {
			workspace: Workspace;
			member: Member;
		};
	}
>(async (c, next) => {
	const user = c.get("user")!;
	const { workspaceIdOrSlug } = c.req.query();

	const currentWorkspace = await db.query.workspace.findFirst({
		where: (workspace, { eq, or }) =>
			or(eq(workspace.slug, workspaceIdOrSlug), eq(workspace.publicId, workspaceIdOrSlug)),
	});
	if (!currentWorkspace) {
		throw new HTTPException(HTTPStatus.codes.BAD_REQUEST, {
			message: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND,
		});
	}

	const currentMember = await db.query.member.findFirst({
		where: (table, { eq, and }) =>
			and(eq(table.workspaceId, currentWorkspace.id), eq(table.userId, user.id)),
	});
	if (!currentMember) {
		throw new HTTPException(HTTPStatus.codes.BAD_REQUEST, {
			message: WORKSPACE_ERROR_CODES.MEMBER_NOT_FOUND,
		});
	}

	c.set("workspace", currentWorkspace);
	c.set("member", currentMember);

	await next();
});
