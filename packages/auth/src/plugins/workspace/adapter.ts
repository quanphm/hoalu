import { generateId } from "@hoalu/common/generate-id";
import { BetterAuthError } from "better-auth";
import type { AuthContext, Session } from "better-auth/types";
import { getDate } from "../../utils/date";
import { parseJSON } from "../../utils/parser";
import type { User } from "../../utils/types";
import type { WorkspaceOptions } from "./index";
import type {
	Invitation,
	InvitationInput,
	Member,
	MemberInput,
	Workspace,
	WorkspaceInput,
} from "./schema";

export const getOrgAdapter = (context: AuthContext, options?: WorkspaceOptions) => {
	const adapter = context.adapter;

	return {
		findWorkspaceBySlug: async (slug: string) => {
			return await adapter.findOne<Workspace>({
				model: "workspace",
				where: [
					{
						field: "slug",
						value: slug,
					},
				],
			});
		},
		findWorkspaceById: async (id: number) => {
			return await adapter.findOne<Workspace>({
				model: "workspace",
				where: [
					{
						field: "id",
						value: id,
					},
				],
			});
		},
		findWorkspaceByPublicId: async (id: string) => {
			return await adapter.findOne<Workspace>({
				model: "workspace",
				where: [
					{
						field: "public_id",
						value: id,
					},
				],
			});
		},
		findFullWorkspace: async ({
			workspaceId,
			isSlug,
		}: {
			workspaceId: number | string;
			isSlug?: boolean;
		}) => {
			const workspace = await adapter.findOne<Workspace>({
				model: "workspace",
				where: [{ field: isSlug ? "slug" : "id", value: workspaceId }],
			});
			if (!workspace) {
				return null;
			}
			const [invitations, members] = await Promise.all([
				adapter.findMany<Invitation>({
					model: "invitation",
					where: [{ field: "workspaceId", value: workspace.id }],
				}),
				adapter.findMany<Member>({
					model: "member",
					where: [{ field: "workspaceId", value: workspace.id }],
				}),
			]);

			if (!workspace) return null;

			const userIds = members.map((member) => member.userId);
			const users = await adapter.findMany<User>({
				model: "user",
				where: [{ field: "id", value: userIds, operator: "in" }],
			});

			const userMap = new Map(users.map((user) => [user.id, user]));
			const membersWithUsers = members.map((member) => {
				const user = userMap.get(member.userId);
				if (!user) {
					throw new BetterAuthError("Unexpected error: User not found for member");
				}
				return {
					...member,
					user: {
						id: user.id,
						name: user.name,
						email: user.email,
						image: user.image,
					},
				};
			});

			return {
				...workspace,
				invitations,
				members: membersWithUsers,
			};
		},
		listWorkspaces: async (userId: string) => {
			const members = await adapter.findMany<Member>({
				model: "member",
				where: [
					{
						field: "userId",
						value: userId,
					},
				],
			});

			if (!members || members.length === 0) {
				return [];
			}

			const workspaceIds = members.map((member) => member.workspaceId);
			const workspaces = await adapter.findMany<Workspace>({
				model: "workspace",
				where: [
					{
						field: "id",
						value: workspaceIds,
						operator: "in",
					},
				],
			});
			return workspaces;
		},
		createWorkspace: async (data: {
			workspace: WorkspaceInput;
			user: User;
		}) => {
			const workspace = await adapter.create<WorkspaceInput, Workspace>({
				model: "workspace",
				data: {
					...data.workspace,
					metadata: data.workspace.metadata ? JSON.stringify(data.workspace.metadata) : undefined,
				},
			});
			const member = await adapter.create<MemberInput>({
				model: "member",
				data: {
					workspaceId: workspace.id,
					userId: data.user.id,
					createdAt: new Date(),
					role: options?.creatorRole || "owner",
				},
			});
			return {
				...workspace,
				metadata: workspace.metadata ? JSON.parse(workspace.metadata) : undefined,
				members: [
					{
						...member,
						user: {
							id: data.user.id,
							name: data.user.name,
							email: data.user.email,
							image: data.user.image,
						},
					},
				],
			};
		},
		findMemberByEmail: async (data: {
			email: string;
			workspaceId: number;
		}) => {
			const user = await adapter.findOne<User>({
				model: "user",
				where: [
					{
						field: "email",
						value: data.email,
					},
				],
			});
			if (!user) {
				return null;
			}
			const member = await adapter.findOne<Member>({
				model: "member",
				where: [
					{
						field: "workspaceId",
						value: data.workspaceId,
					},
					{
						field: "userId",
						value: user.id,
					},
				],
			});
			if (!member) {
				return null;
			}
			return {
				...member,
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
					image: user.image,
				},
			};
		},
		findMemberByWorkspaceId: async (data: {
			userId: number;
			workspaceId: number;
		}) => {
			const [member, user] = await Promise.all([
				await adapter.findOne<Member>({
					model: "member",
					where: [
						{
							field: "userId",
							value: data.userId,
						},
						{
							field: "workspaceId",
							value: data.workspaceId,
						},
					],
				}),
				await adapter.findOne<User>({
					model: "user",
					where: [
						{
							field: "id",
							value: data.userId,
						},
					],
				}),
			]);
			if (!user || !member) {
				return null;
			}
			return {
				...member,
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
					image: user.image,
				},
			};
		},
		findMemberByUserId: async (id: number) => {
			const member = await adapter.findOne<Member>({
				model: "member",
				where: [
					{
						field: "userId",
						value: id,
					},
				],
			});
			if (!member) {
				return null;
			}
			const user = await adapter.findOne<User>({
				model: "user",
				where: [
					{
						field: "id",
						value: member.userId,
					},
				],
			});
			if (!user) {
				return null;
			}
			return {
				...member,
				user,
			};
		},
		createMember: async (data: MemberInput) => {
			const member = await adapter.create<MemberInput>({
				model: "member",
				data: data,
			});
			return member;
		},
		updateMember: async (memberId: number, role: string) => {
			const member = await adapter.update<Member>({
				model: "member",
				where: [
					{
						field: "id",
						value: memberId,
					},
				],
				update: {
					role,
				},
			});
			return member;
		},
		deleteMember: async (memberId: number) => {
			await adapter.delete<Member>({
				model: "member",
				where: [
					{
						field: "id",
						value: memberId,
					},
				],
			});
			return memberId;
		},
		updateWorkspace: async (workspaceId: number, data: Partial<Workspace>) => {
			const workspace = await adapter.update<Workspace>({
				model: "workspace",
				where: [
					{
						field: "id",
						value: workspaceId,
					},
				],
				update: {
					...data,
					metadata:
						typeof data.metadata === "object" ? JSON.stringify(data.metadata) : data.metadata,
				},
			});
			if (!workspace) {
				return null;
			}
			return {
				...workspace,
				metadata: workspace.metadata
					? parseJSON<Record<string, any>>(workspace.metadata)
					: undefined,
			};
		},
		deleteWorkspace: async (workspaceId: number) => {
			await adapter.delete<Workspace>({
				model: "workspace",
				where: [
					{
						field: "id",
						value: workspaceId,
					},
				],
			});
			return workspaceId;
		},
		setActiveWorkspace: async (sessionToken: string, workspaceId: number | null) => {
			const session = await context.internalAdapter.updateSession(sessionToken, {
				activeWorkspaceId: workspaceId,
			});
			return session as Session;
		},

		createInvitation: async ({
			invitation,
			user,
		}: {
			invitation: {
				email: string;
				role: string;
				workspaceId: number;
			};
			user: User;
		}) => {
			const defaultExpiration = 1000 * 60 * 60 * 24;
			const expiresAt = getDate(options?.invitationExpiresIn || defaultExpiration);
			const invite = await adapter.create<Invitation, Invitation>({
				model: "invitation",
				data: {
					id: generateId({ use: "uuid" }),
					email: invitation.email,
					role: invitation.role,
					workspaceId: invitation.workspaceId,
					status: "pending",
					expiresAt,
					inviterId: user.id,
				},
			});

			return invite;
		},
		findInvitationById: async (id: string) => {
			const invitation = await adapter.findOne<Invitation>({
				model: "invitation",
				where: [
					{
						field: "id",
						value: id,
					},
				],
			});
			return invitation;
		},
		findPendingInvitation: async (data: {
			email: string;
			workspaceId: number;
		}) => {
			const invitation = await adapter.findMany<Invitation>({
				model: "invitation",
				where: [
					{
						field: "email",
						value: data.email,
					},
					{
						field: "workspaceId",
						value: data.workspaceId,
					},
					{
						field: "status",
						value: "pending",
					},
				],
			});
			return invitation.filter((invite) => new Date(invite.expiresAt) > new Date());
		},
		updateInvitation: async (data: {
			invitationId: string;
			status: "accepted" | "canceled" | "rejected";
		}) => {
			const invitation = await adapter.update<Invitation>({
				model: "invitation",
				where: [
					{
						field: "id",
						value: data.invitationId,
					},
				],
				update: {
					status: data.status,
				},
			});
			return invitation;
		},
	};
};
