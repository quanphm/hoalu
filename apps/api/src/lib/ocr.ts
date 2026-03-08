import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import * as z from "zod";

const ReceiptDataSchema = z.object({
	amount: z.coerce.number().describe("Total amount on the receipt"),
	date: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.describe("Receipt date in YYYY-MM-DD format"),
	merchantName: z.string().describe("Name of the merchant or store"),
	suggestedCategoryId: z
		.string()
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

interface Category {
	id: string;
	name: string;
}

export async function extractReceiptData(
	imageBase64: string,
	categories: Category[],
): Promise<ReceiptData | null> {
	// Guard: return null if API key is not configured
	if (!process.env.OPENROUTER_API_KEY) {
		console.warn("OPENROUTER_API_KEY is not configured - OCR is disabled");
		return null;
	}

	const openrouter = createOpenRouter({
		apiKey: process.env.OPENROUTER_API_KEY,
	});

	const categoryListText =
		categories.length > 0
			? `Available categories:\n${categories.map((c) => `- ${c.name} (id: ${c.id})`).join("\n")}`
			: "No categories available - set suggestedCategoryId to null.";

	try {
		const result = await generateObject({
			model: openrouter("mistralai/mistral-small-3.2-24b-instruct"),
			schema: ReceiptDataSchema,
			messages: [
				{
					role: "user",
					content: [
						{
							type: "text",
							text: `You are a receipt OCR system. Extract the following information from the receipt image:
- Total amount (the final total, not subtotal)
- Date (in YYYY-MM-DD format)
- Merchant/store name
- Currency (3-letter ISO code like USD, EUR, VND)
- Confidence score (0-1) based on image quality and clarity
- Line items (optional, only if clearly visible)

${categoryListText}

Match the receipt to one of the available categories based on the merchant name and items. If no good match exists, set suggestedCategoryId to null.

Return accurate data with high confidence only if you can read the receipt clearly.`,
						},
						{
							type: "image",
							image: imageBase64,
						},
					],
				},
			],
		});

		return result.object;
	} catch (error) {
		console.error("OCR extraction failed:", error);
		return null;
	}
}
