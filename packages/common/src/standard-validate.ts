import type { StandardSchemaV1 } from "@standard-schema/spec";

export function createStandardIssues(issues: readonly { message: string }[]) {
	return issues.map((issue) => {
		return issue.message;
	});
}

export function standardValidate<T extends StandardSchemaV1>(
	schema: T,
	input: StandardSchemaV1.InferInput<T>,
) {
	const parsed = schema["~standard"].validate(input);
	if (parsed instanceof Promise) {
		throw new TypeError("Schema validation must be synchronous");
	}
	if (parsed.issues) {
		const reducedIssues = createStandardIssues(parsed.issues);
		throw new Error(`❌ Invalid environment variables: ${JSON.stringify(reducedIssues, null, 2)}`);
	}
	return parsed.value;
}
