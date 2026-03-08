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

export function useReceiptScan() {
	const workspace = useWorkspace();

	return useMutation({
		mutationFn: async (imageBase64: string) => {
			const result = await apiClient.files.scanReceipt(workspace.slug, imageBase64);
			return result as ReceiptData | null;
		},
	});
}
