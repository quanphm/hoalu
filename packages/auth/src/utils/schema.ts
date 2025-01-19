import type { AuthPluginSchema } from "better-auth/types";

export function mergeSchema<S extends AuthPluginSchema>(
	schema: S,
	newSchema?: {
		[K in keyof S]?: {
			modelName?: string;
			fields?: {
				[P: string]: string;
			};
		};
	},
) {
	if (!newSchema) {
		return schema;
	}
	for (const table in newSchema) {
		const newModelName = newSchema[table]?.modelName;
		if (newModelName) {
			schema[table].modelName = newModelName;
		}
		for (const field in schema[table].fields) {
			const newField = newSchema[table]?.fields?.[field];
			if (!newField) {
				continue;
			}
			schema[table].fields[field].fieldName = newField;
		}
	}
	return schema;
}
