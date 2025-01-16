import * as v from "valibot";
import type { BaseIssue, BaseSchema } from "valibot";

interface ReducedValibotIssue {
	attribute: string | undefined;
	input: unknown;
	message: string;
}

export function reduceValibotIssues(issues: BaseIssue<any>[]): ReducedValibotIssue[] {
	return issues.map((issue) => {
		const attribute = typeof issue.path?.[0].key === "string" ? issue.path?.[0].key : undefined;

		return {
			attribute,
			input: issue.input,
			message: issue.message,
		};
	});
}

export function validateEnv<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
	schema: TSchema,
	envVars: Record<string, unknown>,
) {
	const parsed = v.safeParse(schema, envVars);
	if (!parsed.success) {
		const reducedIssues: ReducedValibotIssue[] = reduceValibotIssues(parsed.issues);
		throw new Error(`❌ Invalid environment variables: ${JSON.stringify(reducedIssues)}`);
	}
	return parsed.output;
}
