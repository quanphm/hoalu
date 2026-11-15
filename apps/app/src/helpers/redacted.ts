export const REDACTED_AMOUNT = "*****";

export const REDACTED_TICK = "•••";

export function redactTick(text: string, isRedacted: boolean): string {
	return isRedacted ? REDACTED_TICK : text;
}
