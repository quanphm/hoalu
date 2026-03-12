import { useMutation } from "@tanstack/react-query";

import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { apiClient } from "#app/lib/api-client.ts";

export interface ReceiptData {
	amount: number;
	date: string;
	merchantName: string;
	suggestedCategoryId: string | null;
	currency: string;
	confidence: number;
	items?: Array<{
		name: string;
		quantity?: number;
		price?: number;
	}>;
}

export interface ReceiptScanResult {
	/** The original File object (image or PDF) */
	file: File;
	/** Compressed JPEG base64 used for preview (null for PDFs) */
	previewBase64: string | null;
	/** OCR result — null if extraction failed for this attachment */
	data: ReceiptData | null;
}

export function useReceiptScan() {
	const workspace = useWorkspace();

	return useMutation({
		mutationFn: async (
			items: Array<{ file: File; previewBase64: string | null; base64: string }>,
		): Promise<ReceiptScanResult[]> => {
			const imagesBase64 = items.map((i) => i.base64);
			const results = await apiClient.files.scanReceipt(workspace.slug, imagesBase64);

			return items.map((item, idx) => ({
				file: item.file,
				previewBase64: item.previewBase64,
				data: (results[idx] as ReceiptData | null) ?? null,
			}));
		},
	});
}
