import { generateId } from "@hoalu/common/generate-id";
import type { BetterAuthPlugin } from "better-auth";

export const userPublicId = () => {
	return {
		id: "user-public-id",
		schema: {
			user: {
				fields: {
					publicId: {
						type: "string",
						required: false,
						unique: true,
						input: false,
					},
				},
			},
		},
		init: () => {
			return {
				options: {
					databaseHooks: {
						user: {
							create: {
								async before(user) {
									return {
										data: {
											...user,
											publicId: generateId("user"),
										},
									};
								},
							},
						},
					},
				},
			};
		},
	} satisfies BetterAuthPlugin;
};
