import { generateId } from "@woben/common";
import type { BetterAuthPlugin } from "better-auth";

export const userPublicId = () =>
	({
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
	}) satisfies BetterAuthPlugin;
