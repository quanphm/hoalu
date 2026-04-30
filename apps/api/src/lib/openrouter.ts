import { openRouterText } from "@tanstack/ai-openrouter";

const MODEL = [
	"mistralai/mistral-small-2603", // Mistral: Mistral Small 4
	"google/gemini-3-flash-preview",
] as const;

export const openRouterTextAdapter = openRouterText(MODEL[1]);

export const openRouterImageAdapter = openRouterText(MODEL[1]);
