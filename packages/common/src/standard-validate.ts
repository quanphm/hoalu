import type { StandardSchemaV1 } from "@standard-schema/spec";

export function createIssueMsg(issues: readonly { message: string }[]) {
	const stdIssues = issues.map((issue) => issue.message);
	return stdIssues.length > 0 ? stdIssues[0] : "";
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
		const reducedIssues = createIssueMsg(parsed.issues);
		throw new Error(`❌ Invalid environment variables: ${JSON.stringify(reducedIssues, null, 2)}`);
	}
	return parsed.value;
}
