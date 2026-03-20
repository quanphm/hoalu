import { chat } from "@tanstack/ai";
import * as z from "zod";

import { openRouterTextAdapter } from "./openrouter";

const VoiceExpenseDataSchema = z.object({
	title: z
		.string()
		.describe("Short descriptive title for the expense (e.g. 'Coffee', 'Grocery shopping')"),
	amount: z.number().describe("Numeric amount of the expense after expanding shorthand notation"),
	currency: z.string().length(3).describe("3-letter ISO currency code (e.g. USD, EUR, VND)"),
	date: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.describe("Date of the expense in YYYY-MM-DD format"),
	suggestedCategoryId: z
		.uuid()
		.nullable()
		.describe(
			"UUID of the best matching category from the provided list, or null if no good match",
		),
	repeat: z
		.enum(["one-time", "daily", "weekly", "monthly", "yearly"])
		.describe("Recurrence pattern, default to one-time unless user explicitly mentions repeating"),
	confidence: z
		.number()
		.min(0)
		.max(1)
		.describe(
			"Confidence score from 0 to 1 based on how clearly the expense details were understood",
		),
});

export type VoiceExpenseData = z.infer<typeof VoiceExpenseDataSchema>;

interface Category {
	id: string;
	name: string;
}

interface ParseContext {
	today: string;
	availableCurrencies: string[];
	/** @deprecated Language is now auto-detected. Kept for backward compatibility with voice endpoint. */
	lang?: "en-US" | "vi-VN";
}

export async function parseVoiceExpense(
	transcription: string,
	categories: Category[],
	context: ParseContext,
): Promise<VoiceExpenseData | null> {
	const categoryListText =
		categories.length > 0
			? `Available categories:\n${categories.map((c) => `- ${c.name} (id: ${c.id})`).join("\n")}`
			: "No categories available - set suggestedCategoryId to null.";

	const currenciesText = `Available currencies: ${context.availableCurrencies.join(", ")}. Default to the most contextually appropriate one if not mentioned.`;

	try {
		const result = await chat({
			adapter: openRouterTextAdapter,
			outputSchema: VoiceExpenseDataSchema,
			messages: [
				{
					role: "user",
					content: `You are an expense tracking assistant. Parse the following text into a structured expense record.

Auto-detect the language (English, Vietnamese, or mixed) and apply all rules accordingly.

Today's date: ${context.today}

${currenciesText}

${categoryListText}

## Amount shorthand notation — ALWAYS expand these:
- "k" or "K" = thousands → "15k" = 15000, "2.5k" = 2500
- "m" or "M" = millions → "1m" = 1000000, "1.5M" = 1500000
- "nghìn" or "ngàn" = thousands → "15 nghìn" = 15000
- "triệu" = millions → "2 triệu" = 2000000
- "tr" = triệu (millions) → "1.5tr" = 1500000
- "b" or "B" or "tỷ" = billions → "1b" = 1000000000

## Date expressions (convert to YYYY-MM-DD):
English: "today" = ${context.today}, "yesterday" = day before ${context.today}, "last week", "last month"
Vietnamese: "hôm nay" = ${context.today}, "hôm qua" = yesterday, "tuần trước" = last week, "tháng trước" = last month, "ngày mồng 5" = 5th of current month
If no date is mentioned, use today: ${context.today}

## Rules:
- Extract the expense title, amount, currency, and date
- ALWAYS expand shorthand amounts (k/K/m/M/nghìn/triệu/tr/tỷ) into full numbers
- If no currency is mentioned, infer from context: Vietnamese text or "nghìn"/"triệu" → VND, "dollar"/"$" → USD, otherwise use the first available currency
- Match the expense to the most relevant category based on the description
- Handle Vietnamese, English, and mixed-language input seamlessly
- Set repeat to "one-time" unless user explicitly says "every month"/"hàng tháng", "weekly"/"hàng tuần", "daily"/"hàng ngày", "yearly"/"hàng năm"
- Set confidence based on how clearly and completely the details were provided

Text: "${transcription}"`,
				},
			],
		});

		return result;
	} catch (error) {
		console.error("Voice expense parsing failed:", error);
		return null;
	}
}
