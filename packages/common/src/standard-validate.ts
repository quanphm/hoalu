import type { StandardSchemaV1 } from "@standard-schema/spec";

export function createStandardIssues(issues) {
	return issues.map((issue) => {
		return {
			input: issue.input,
			message: issue.message,
		};
	});
}

export async function standardValidate<T extends StandardSchemaV1>(
	schema: T,
	input: StandardSchemaV1.InferInput<T>,
) {
	let parsed = schema["~standard"].validate(input);
	if (parsed instanceof Promise) {
		parsed = await parsed;
	}
	if (parsed.issues) {
		const reducedIssues = createStandardIssues(parsed.issues);
		throw new Error(`❌ Invalid environment variables: ${JSON.stringify(reducedIssues, null, 2)}`);
	}
	return parsed.value;
}
