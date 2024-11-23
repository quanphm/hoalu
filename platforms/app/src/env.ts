import * as v from "valibot";
import type { BaseIssue, BaseSchema } from "valibot";

interface ReducedIssue {
	attribute: string | undefined;
	input: unknown;
	message: string;
}

function reduceIssues(issues: BaseIssue<any>[]): ReducedIssue[] {
	return issues.map((issue) => {
		const attribute = typeof issue.path?.[0].key === "string" ? issue.path?.[0].key : undefined;

		return {
			attribute,
			input: issue.input,
			message: issue.message,
		};
	});
}

function validateEnv<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
	schema: TSchema,
	envVars: Record<string, unknown>,
) {
	const parsed = v.safeParse(schema, envVars);
	if (!parsed.success) {
		const reducedIssues: ReducedIssue[] = reduceIssues(parsed.issues);
		throw new Error(`❌ Invalid environment variables: ${JSON.stringify(reducedIssues)}`);
	}
	return parsed.output;
}

const ServerSchema = v.object({
	DATABASE_URL: v.pipe(v.string(), v.minLength(1), v.url()),
});

export const serverEnv = validateEnv(ServerSchema, {
	DATABASE_URL: process.env.DATABASE_URL,
});
