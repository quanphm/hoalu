import { openRouterText } from "@tanstack/ai-openrouter";

const MODEL = [
	"mistralai/mistral-small-2603", // Mistral: Mistral Small 4
	"mistralai/mistral-small-3.2-24b-instruct", // Mistral: Mistral Small 3.2 24B
] as const;

export const openRouterTextAdapter = openRouterText(MODEL[0]);

export const openRouterImageAdapter = openRouterText(MODEL[0]);
