import { NonRetriableError } from "@tanstack/offline-transactions";

const PERMANENT_STATUSES = new Set([400, 404, 405, 409, 410, 422]);

export class HttpError extends Error {
	readonly status: number;

	constructor(status: number, message: string) {
		super(message);
		this.name = "HttpError";
		this.status = status;
	}
}

/**
 * The executor's default retry policy only inspects `error.message`, so a
 * permanent rejection has to be classified here as well as by status.
 */
export function toMutationError(status: number, message: string): Error {
	if (PERMANENT_STATUSES.has(status)) {
		return new NonRetriableError(message);
	}
	return new HttpError(status, message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function readMessage(value: unknown): string | undefined {
	if (!isRecord(value)) return undefined;
	return typeof value.message === "string" ? value.message : undefined;
}

export async function readApiResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const body: unknown = await response.json().catch(() => null);
		throw toMutationError(
			response.status,
			readMessage(body) ?? `Request failed (${response.status})`,
		);
	}

	const body: unknown = await response.json();
	if (!isRecord(body) || !("data" in body)) {
		throw toMutationError(response.status, "Malformed response body");
	}
	return body.data as T;
}
