import { generateId } from "@hoalu/common/generate-id";
import { eq, inArray } from "drizzle-orm";
import { db, schema } from "../../db";

type NewFile = typeof schema.image.$inferInsert;
type NewFileExpense = typeof schema.imageExpense.$inferInsert;

export class FileRepository {
	async findAllByWorkspaceId(param: { workspaceId: string }) {
		const imageExpenseSubquery = db
			.select({ imageId: schema.imageExpense.imageId })
			.from(schema.imageExpense)
			.where(eq(schema.imageExpense.workspaceId, param.workspaceId))
			.as("image_expense_subquery");

		const imageTaskSubquery = db
			.select({ imageId: schema.imageTask.imageId })
			.from(schema.imageTask)
			.where(eq(schema.imageTask.workspaceId, param.workspaceId))
			.as("image_task_subquery");

		const combinedImageIds = await db
			.selectDistinct({ imageId: imageExpenseSubquery.imageId })
			.from(imageExpenseSubquery)
			.union(db.selectDistinct({ imageId: imageTaskSubquery.imageId }).from(imageTaskSubquery));

		if (combinedImageIds.length === 0) {
			return [];
		}

		const imageIds = combinedImageIds.map((item) => item.imageId);
		const images = await db.select().from(schema.image).where(inArray(schema.image.id, imageIds));

		return images;
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

	async insert(param: Omit<NewFile, "id">) {
		const [image] = await db
			.insert(schema.image)
			.values({
				id: generateId({ use: "uuid" }),
				...param,
			})
			.returning();

		return image;
	}

	async insertFileExpense(param: NewFileExpense[]) {
		const images = await db.insert(schema.imageExpense).values(param).returning();
		return images;
	}
}
