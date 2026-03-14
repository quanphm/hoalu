import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import * as z from "zod";

const VoiceExpenseDataSchema = z.object({
	title: z
		.string()
		.describe("Short descriptive title for the expense (e.g. 'Coffee', 'Grocery shopping')"),
	amount: z.coerce.number().describe("Numeric amount of the expense"),
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
		.default("one-time")
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
	lang: "en-US" | "vi-VN";
}

export async function parseVoiceExpense(
	transcription: string,
	categories: Category[],
	context: ParseContext,
): Promise<VoiceExpenseData | null> {
	if (!process.env.OPENROUTER_API_KEY) {
		console.warn("OPENROUTER_API_KEY is not configured - voice parsing is disabled");
		return null;
	}

	const openrouter = createOpenRouter({
		apiKey: process.env.OPENROUTER_API_KEY,
	});

	const categoryListText =
		categories.length > 0
			? `Available categories:\n${categories.map((c) => `- ${c.name} (id: ${c.id})`).join("\n")}`
			: "No categories available - set suggestedCategoryId to null.";

	const currenciesText = `Available currencies: ${context.availableCurrencies.join(", ")}. Default to the most contextually appropriate one if not mentioned.`;

	const vietnameseDateExamples = `
Vietnamese date examples (convert to YYYY-MM-DD):
- "hôm nay" = today = ${context.today}
- "hôm qua" = yesterday = calculate from ${context.today}
- "tuần trước" = last week = calculate from ${context.today}
- "tháng trước" = last month = calculate from ${context.today}
- "ngày mồng 5" = 5th day of month`;

	const englishDateExamples = `
English date examples (convert to YYYY-MM-DD):
- "today" = ${context.today}
- "yesterday" = calculate from ${context.today}
- "last week" = calculate from ${context.today}
- "last month" = calculate from ${context.today}`;

	const rulesText =
		context.lang === "vi-VN"
			? `Quy tắc / Rules:
- Trích xuất tiêu đề, số tiền, loại tiền tệ và ngày từ bản ghi thoại
- Nếu không có ngày, sử dụng ngày hôm nay (${context.today})
- Nếu không có loại tiền tệ, suy luận từ ngữ cảnh (ví dụ: "nghìn" = VND, "dollar" = USD)
- Khớp với danh mục phù hợp nhất dựa trên tên hoặc mô tả
- Xử lý cả ngày tiếng Việt và tiếng Anh
- Đặt repeat thành one-time trừ khi người dùng nói rõ "mỗi tháng", "hàng tuần", v.v.
- Đặt confidence dựa trên mức độ rõ ràng của chi tiết`
			: `Rules:
- Extract the expense title, amount, currency, and date from the transcription
- If no date is mentioned, use today's date (${context.today})
- If no currency is mentioned, infer from context (e.g., "nghìn" = VND, "dollar" = USD)
- Match the expense to the most relevant category based on merchant name or description
- Handle both Vietnamese and English date expressions
- Set repeat to one-time unless user explicitly says "every month", "weekly", etc.
- Set confidence based on how clearly and completely the details were provided`;

	try {
		const result = await generateObject({
			model: openrouter("mistralai/mistral-small-3.2-24b-instruct"),
			schema: VoiceExpenseDataSchema,
			messages: [
				{
					role: "user",
					content: `You are an expense tracking assistant. Parse the following voice transcription into a structured expense record.

Today's date: ${context.today}

${currenciesText}

${context.lang === "vi-VN" ? vietnameseDateExamples : englishDateExamples}

${categoryListText}

${rulesText}

Transcription (${context.lang === "vi-VN" ? "Vietnamese" : "English"}): "${transcription}"`,
				},
			],
		});

		return result.object;
	} catch (error) {
		console.error("Voice expense parsing failed:", error);
		return null;
	}
}
