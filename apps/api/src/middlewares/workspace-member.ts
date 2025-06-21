import { WORKSPACE_ERROR_CODES } from "@hoalu/auth/plugins";
import { HTTPStatus } from "@hoalu/common/http-status";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { db } from "../db";
import type { AppBindings } from "../types";

interface Member {
	id: string;
	createdAt: Date;
	userId: string;
	workspaceId: string;
	role: string;
}

interface Workspace {
	id: string;
	publicId: string;
	name: string;
	createdAt: Date;
	slug: string;
	logo: string | null;
	metadata: Record<string, any>;
	members: Omit<Member, "workspaceId" | "createdAt">[];
}

export const workspaceMember = createMiddleware<
	AppBindings & {
		Variables: {
			workspace: Workspace;
			membership: Member;
		};
	}
>(async (c, next) => {
	const user = c.get("user");

	if (!user) {
		throw new HTTPException(HTTPStatus.codes.UNAUTHORIZED, {
			message: HTTPStatus.phrases.UNAUTHORIZED,
		});
	}

	const { workspaceIdOrSlug } = c.req.query();

	const currentWorkspace = await db.query.workspace.findFirst({
		where: (table, { eq, or }) =>
			or(eq(table.slug, workspaceIdOrSlug), eq(table.publicId, workspaceIdOrSlug)),
	});
	if (!currentWorkspace) {
		throw new HTTPException(HTTPStatus.codes.BAD_REQUEST, {
			message: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND,
		});
	}

	const allMembersOfCurrentWorkspace = await db.query.member.findMany({
		where: (table, { eq }) => eq(table.workspaceId, currentWorkspace.id),
	});

	const currentMember = allMembersOfCurrentWorkspace.find((member) => member.userId === user.id);
	if (!currentMember) {
		throw new HTTPException(HTTPStatus.codes.BAD_REQUEST, {
			message: WORKSPACE_ERROR_CODES.MEMBER_NOT_FOUND,
		});
	}

	c.set("workspace", {
		...currentWorkspace,
		members: allMembersOfCurrentWorkspace.map((member) => ({
			id: member.id,
			role: member.role,
			userId: member.userId,
		})),
	});
	c.set("membership", currentMember);

	await next();
});
