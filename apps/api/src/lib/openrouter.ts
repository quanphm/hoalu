import { openRouterText } from "@tanstack/ai-openrouter";

const MODEL = ["mistralai/mistral-small-2603", "mistralai/mistral-small-3.2-24b-instruct"] as const;

// @ts-ignore - new models is not yet supported by the library, but it should work fine.
export const openRouterTextAdapter = openRouterText(MODEL[0]);

// @ts-ignore - new models is not yet supported by the library, but it should work fine.
export const openRouterImageAdapter = openRouterText(MODEL[0]);
