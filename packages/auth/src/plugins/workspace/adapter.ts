import { BetterAuthError } from "better-auth";
import type { AuthContext, Session, User } from "better-auth/types";
import { getDate } from "../../utils/date";
import { parseJSON } from "../../utils/parser";
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
		findOrganizationBySlug: async (slug: string) => {
			const organization = await adapter.findOne<Workspace>({
				model: "workspace",
				where: [
					{
						field: "slug",
						value: slug,
					},
				],
			});
			return organization;
		},
		createOrganization: async (data: {
			organization: WorkspaceInput;
			user: User;
		}) => {
			const organization = await adapter.create<WorkspaceInput, Workspace>({
				model: "workspace",
				data: {
					...data.organization,
					metadata: data.organization.metadata
						? JSON.stringify(data.organization.metadata)
						: undefined,
				},
			});
			const member = await adapter.create<MemberInput>({
				model: "member",
				data: {
					workspaceId: organization.id,
					userId: data.user.id,
					createdAt: new Date(),
					role: options?.creatorRole || "owner",
				},
			});
			return {
				...organization,
				metadata: organization.metadata ? JSON.parse(organization.metadata) : undefined,
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
			organizationId: number;
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
						value: data.organizationId,
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
		findMemberByOrgId: async (data: {
			userId: string;
			organizationId: number;
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
							value: data.organizationId,
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
		findMemberById: async (memberId: string) => {
			const member = await adapter.findOne<Member>({
				model: "member",
				where: [
					{
						field: "id",
						value: memberId,
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
		createMember: async (data: MemberInput) => {
			const member = await adapter.create<MemberInput>({
				model: "member",
				data: data,
			});
			return member;
		},
		updateMember: async (memberId: string, role: string) => {
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
			const member = await adapter.delete<Member>({
				model: "member",
				where: [
					{
						field: "id",
						value: memberId,
					},
				],
			});
			return member;
		},
		updateOrganization: async (organizationId: number, data: Partial<Workspace>) => {
			const organization = await adapter.update<Workspace>({
				model: "workspace",
				where: [
					{
						field: "id",
						value: organizationId,
					},
				],
				update: {
					...data,
					metadata:
						typeof data.metadata === "object" ? JSON.stringify(data.metadata) : data.metadata,
				},
			});
			if (!organization) {
				return null;
			}
			return {
				...organization,
				metadata: organization.metadata
					? parseJSON<Record<string, any>>(organization.metadata)
					: undefined,
			};
		},
		deleteOrganization: async (organizationId: number) => {
			await adapter.delete({
				model: "member",
				where: [
					{
						field: "workspaceId",
						value: organizationId,
					},
				],
			});
			await adapter.delete({
				model: "invitation",
				where: [
					{
						field: "workspaceId",
						value: organizationId,
					},
				],
			});
			await adapter.delete<Workspace>({
				model: "workspace",
				where: [
					{
						field: "id",
						value: organizationId,
					},
				],
			});
			return organizationId;
		},
		setActiveOrganization: async (sessionToken: string, organizationId: number | null) => {
			const session = await context.internalAdapter.updateSession(sessionToken, {
				activeOrganizationId: organizationId,
			});
			return session as Session;
		},
		findOrganizationById: async (organizationId: number) => {
			const organization = await adapter.findOne<Workspace>({
				model: "workspace",
				where: [
					{
						field: "id",
						value: organizationId,
					},
				],
			});
			return organization;
		},
		findFullOrganization: async ({
			organizationId,
			isSlug,
		}: {
			organizationId: number | string;
			isSlug?: boolean;
		}) => {
			const org = await adapter.findOne<Workspace>({
				model: "workspace",
				where: [{ field: isSlug ? "slug" : "id", value: organizationId }],
			});
			if (!org) {
				return null;
			}
			const [invitations, members] = await Promise.all([
				adapter.findMany<Invitation>({
					model: "invitation",
					where: [{ field: "workspaceId", value: org.id }],
				}),
				adapter.findMany<Member>({
					model: "member",
					where: [{ field: "workspaceId", value: org.id }],
				}),
			]);

			if (!org) return null;

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
				...org,
				invitations,
				members: membersWithUsers,
			};
		},
		listOrganizations: async (userId: string) => {
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

			const organizationIds = members.map((member) => member.workspaceId);

			const organizations = await adapter.findMany<Workspace>({
				model: "workspace",
				where: [
					{
						field: "id",
						value: organizationIds,
						operator: "in",
					},
				],
			});
			return organizations;
		},
		createInvitation: async ({
			invitation,
			user,
		}: {
			invitation: {
				email: string;
				role: string;
				organizationId: number;
			};
			user: User;
		}) => {
			const defaultExpiration = 1000 * 60 * 60 * 24;
			const expiresAt = getDate(options?.invitationExpiresIn || defaultExpiration);
			const invite = await adapter.create<InvitationInput, Invitation>({
				model: "invitation",
				data: {
					email: invitation.email,
					role: invitation.role,
					workspaceId: invitation.organizationId,
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
			organizationId: number;
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
						value: data.organizationId,
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
