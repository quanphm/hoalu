import { chat } from "@tanstack/ai";
import type { ConstrainedModelMessage, TextPart, ImagePart } from "@tanstack/ai";
import type { OpenRouterMessageMetadataByModality } from "@tanstack/ai-openrouter";
import * as z from "zod";

import { openRouterImageAdapter } from "./openrouter";

/**
 * Convert merchant name from ALL CAPS to Title Case
 * Only transforms if the entire string is uppercase
 */
function toTitleCase(name: string): string {
	// If it's not all uppercase, return as-is
	if (name !== name.toUpperCase()) {
		return name;
	}

	// Split by spaces and common separators
	return name
		.split(/([\s&'-]+)/)
		.map((part) => {
			// Keep separators as-is
			if (/^[\s&'-]+$/.test(part)) {
				return part;
			}
			// Capitalize first letter, lowercase the rest
			return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
		})
		.join("");
}

const ReceiptDataSchema = z.object({
	amount: z.number().describe("Total amount on the receipt"),
	date: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.describe("Receipt date in YYYY-MM-DD format"),
	merchantName: z.string().transform(toTitleCase).describe("Name of the merchant or store"),
	suggestedCategoryId: z
		.uuid()
		.nullable()
		.describe(
			"UUID of the best matching category from the provided list, or null if no good match",
		),
	currency: z.string().length(3).describe("3-letter ISO currency code (e.g. USD, EUR, VND)"),
	confidence: z
		.number()
		.min(0)
		.max(1)
		.describe("Confidence score from 0 to 1 for the extraction accuracy"),
	items: z
		.array(
			z.object({
				name: z.string(),
				quantity: z.number().optional(),
				price: z.number().optional(),
			}),
		)
		.optional()
		.describe("Line items from the receipt (if clearly visible)"),
});

export type ReceiptData = z.infer<typeof ReceiptDataSchema>;

export interface ConversationTurn {
	role: "user" | "assistant";
	content: string;
}

export interface ReceiptExtractionResult {
	data: ReceiptData | null;
	conversationHistory: ConversationTurn[];
}

interface Category {
	id: string;
	name: string;
}

function buildSystemPrompt(categoryListText: string): string {
	return `You are a receipt OCR system. Extract the following information from the receipt image:
- Total amount (the final total, not subtotal)
- Date (output always as YYYY-MM-DD)
- Merchant/store name
- Currency (3-letter ISO code like USD, EUR, VND)
- Confidence score (0-1) based on image quality and clarity
- Line items (optional, only if clearly visible)

${categoryListText}

Match the receipt to one of the available categories based on the merchant name and items. If no good match exists, set suggestedCategoryId to null.

DATE FORMAT RULES — use all available signals to determine the correct date:
1. If a digit in the day or month position is > 12, that unambiguously identifies which field is which.
2. Infer locale from the language printed on the receipt and the merchant country:
   - Vietnamese, French, German, Spanish, Portuguese, Dutch, Italian, Thai, Indonesian → DD/MM/YYYY
   - Japanese, Chinese, Korean → YYYY/MM/DD or YYYY年MM月DD日
   - US English, Filipino → MM/DD/YYYY
   - UK/Australian English → DD/MM/YYYY
3. When the date is fully ambiguous (both day and month ≤ 12, no locale clues), prefer DD/MM/YYYY as it is the most common format worldwide.
4. Always output the resolved date as YYYY-MM-DD regardless of the source format.

TEXT EXTRACTION RULES — preserve original text exactly:
1. Preserve Vietnamese diacritics (accents) exactly as they appear on the receipt
   - CORRECT: "GÀ GIÒN PHỦ SỐT PHÔ MAI", "CƠM TẤM SƯỜN BÌ"
   - INCORRECT: "GA GION PHU SOT PHO MAI", "COM TAM SUON BI"
2. Do not normalize, transliterate, or convert accented characters to ASCII

Return accurate data with high confidence only if you can read the receipt clearly.`;
}

type OpenRouterInputModalitiesTypes = {
	inputModalities: readonly ["text", "image"];
	messageMetadataByModality: OpenRouterMessageMetadataByModality;
};
type OpenRouterMessage = ConstrainedModelMessage<OpenRouterInputModalitiesTypes>;

export async function extractReceiptData(
	imageBase64: string,
	categories: Category[],
	conversationHistory?: ConversationTurn[],
): Promise<ReceiptExtractionResult> {
	const categoryListText =
		categories.length > 0
			? `Available categories:\n${categories.map((c) => `- ${c.name} (id: ${c.id})`).join("\n")}`
			: "No categories available - set suggestedCategoryId to null.";

	const systemPrompt = buildSystemPrompt(categoryListText);

	const firstMessage: OpenRouterMessage = {
		role: "user",
		content: [
			{
				type: "text",
				content: systemPrompt,
			} satisfies TextPart<OpenRouterMessageMetadataByModality["text"]>,
			{
				type: "image",
				source: {
					type: "data",
					value: imageBase64,
					mimeType: "image/jpeg",
				},
				metadata: {
					detail: "high",
				},
			} satisfies ImagePart<OpenRouterMessageMetadataByModality["image"]>,
		],
	};

	const messages: OpenRouterMessage[] = [firstMessage];

	if (conversationHistory && conversationHistory.length > 0) {
		for (const turn of conversationHistory) {
			messages.push({ role: turn.role, content: turn.content });
		}
	}

	try {
		const result = await chat({
			adapter: openRouterImageAdapter,
			outputSchema: ReceiptDataSchema,
			messages,
		});

		const updatedHistory: ConversationTurn[] = [
			...(conversationHistory ?? [{ role: "user" as const, content: systemPrompt }]),
			{ role: "assistant" as const, content: JSON.stringify(result) },
		];

		return { data: result, conversationHistory: updatedHistory };
	} catch (error) {
		console.error("OCR extraction failed:", error);
		return { data: null, conversationHistory: conversationHistory ?? [] };
	}
}

export async function batchExtractReceiptData(
	imagesBase64: string[],
	categories: Category[],
): Promise<ReceiptExtractionResult[]> {
	return Promise.all(imagesBase64.map((img) => extractReceiptData(img, categories)));
}
