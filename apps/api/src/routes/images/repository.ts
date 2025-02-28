import { generateId } from "@hoalu/common/generate-id";
import { eq } from "drizzle-orm";
import { db, schema } from "../../db";

type NewImage = typeof schema.image.$inferInsert;

export class ImageRepository {
	async findAllByWorkspaceId(param: { workspaceId: string }) {
		const queryData = await db
			.select()
			.from(schema.image)
			.innerJoin(schema.workspace, eq(schema.image.workspaceId, schema.workspace.id))
			.where(eq(schema.image.workspaceId, param.workspaceId));

		const result = queryData.map((data) => ({
			...data.image,
			workspace: data.workspace,
		}));

		return result;
	}

	async findOne(param: { id: string }) {
		const queryData = await db
			.select()
			.from(schema.image)
			.where(eq(schema.image.id, param.id))
			.limit(1);

		if (!queryData[0]) return null;
		return queryData[0];
	}

	async insert(param: Omit<NewImage, "id">) {
		const [image] = await db
			.insert(schema.image)
			.values({
				id: generateId({ use: "uuid" }),
				...param,
			})
			.returning();

		const result = await this.findOne({ id: image.id });
		return result;
	}
}
