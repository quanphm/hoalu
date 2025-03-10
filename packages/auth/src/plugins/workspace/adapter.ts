import { BetterAuthError } from "better-auth";
import type { AuthContext } from "better-auth/types";
import { z } from "zod";
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

export const getAdapter = (context: AuthContext, options?: WorkspaceOptions) => {
	const adapter = context.adapter;

	return {
		async findWorkspace(identifier: string) {
			const isPublicId = identifier.startsWith("ws_");
			if (isPublicId) {
				return await adapter.findOne<Workspace>({
					model: "workspace",
					where: [{ field: "publicId", value: identifier }],
				});
			}
			const isUUID = z.string().uuid().safeParse(identifier);
			if (isUUID.success) {
				return await adapter.findOne<Workspace>({
					model: "workspace",
					where: [{ field: "id", value: identifier }],
				});
			}
			return await adapter.findOne<Workspace>({
				model: "workspace",
				where: [{ field: "slug", value: identifier }],
			});
		},
		async findFullWorkspace(identifier: string) {
			const workspace = await this.findWorkspace(identifier);
			if (!workspace) return null;

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
					user,
				};
			});

			return {
				...workspace,
				invitations,
				members: membersWithUsers,
			};
		},
		async listWorkspaces(userId: string) {
			const members = await adapter.findMany<Member>({
				model: "member",
				where: [{ field: "userId", value: userId }],
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
		async createWorkspace(data: {
			workspace: WorkspaceInput;
			user: User;
		}) {
			const workspace = await adapter.create<WorkspaceInput, Workspace>({
				model: "workspace",
				data: data.workspace,
			});
			const member = await adapter.create<MemberInput, Member>({
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
		async findMemberById(identifier: string) {
			const member = await adapter.findOne<Member>({
				model: "member",
				where: [
					{
						field: "id",
						value: identifier,
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
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
					image: user.image,
				},
			};
		},
		async findMemberByEmail(data: {
			email: string;
			workspaceId: string;
		}) {
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
		async listMembers(data: { workspaceId: string }) {
			const members = await adapter.findMany<Member>({
				model: "member",
				where: [
					{
						field: "workspaceId",
						value: data.workspaceId,
					},
				],
				limit: options?.membershipLimit || 100,
			});
			return members;
		},
		async findMemberByWorkspaceId(data: {
			userId: string;
			workspaceId: string;
		}) {
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
		async createMember(data: MemberInput) {
			const member = await adapter.create<MemberInput, Member>({
				model: "member",
				data: data,
			});
			return member;
		},
		async updateMember(userId: string, workspaceId: string, role: string) {
			const member = await adapter.update<Member>({
				model: "member",
				where: [
					{
						field: "userId",
						value: userId,
					},
					{
						field: "workspaceId",
						value: workspaceId,
					},
				],
				update: {
					role,
				},
			});
			return member;
		},
		async deleteMember(userId: string, workspaceId: string) {
			await adapter.delete<Member>({
				model: "member",
				where: [
					{
						field: "userId",
						value: userId,
					},
					{
						field: "workspaceId",
						value: workspaceId,
					},
				],
			});
			return userId;
		},
		async updateWorkspace(workspaceId: string, data: Partial<Workspace>) {
			const workspace = await adapter.update<Workspace>({
				model: "workspace",
				where: [
					{
						field: "id",
						value: workspaceId,
					},
				],
				update: data,
			});
			return workspace ?? null;
		},
		async deleteWorkspace(workspaceId: string) {
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
		async createInvitation({
			invitation,
			user,
		}: {
			invitation: {
				email: string;
				role: string;
				workspaceId: string;
			};
			user: User;
		}) {
			const defaultExpiration = 1000 * 60 * 60 * 24;
			const expiresAt = getDate(options?.invitationExpiresIn || defaultExpiration);
			const invite = await adapter.create<InvitationInput, Invitation>({
				model: "invitation",
				data: {
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
		async findInvitationById(id: string) {
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
		async findPendingInvitation(data: {
			email: string;
			workspaceId: string;
		}) {
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
		async updateInvitation(data: {
			invitationId: string;
			status: "accepted" | "canceled" | "rejected";
		}) {
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
