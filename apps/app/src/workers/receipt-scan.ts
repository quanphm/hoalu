interface ReceiptScanInput {
	fileName: string;
	fileSize: number;
	fileType: string;
	previewBase64: string | null;
	encodedBase64: string;
	workspaceSlug: string;
}

interface WorkerRequest<TInput> {
	jobId: string;
	input: TInput;
}

interface WorkerSuccessResponse<TResult> {
	jobId: string;
	result: TResult;
}

interface WorkerErrorResponse {
	jobId: string;
	error: string;
}

type WorkerResponse<TResult> = WorkerSuccessResponse<TResult> | WorkerErrorResponse;

interface ReceiptData {
	items?: Array<{
		name: string;
		price: number;
		quantity?: number;
	}>;
	currency?: string;
	date?: string;
	merchantName?: string;
	merchantAddress?: string;
	totalAmount?: number;
	taxAmount?: number;
}

const API_BASE_URL = import.meta.env.PUBLIC_API_URL;

async function scanReceipt(slug: string, base64Image: string): Promise<ReceiptData | null> {
	try {
		const response = await fetch(
			`${API_BASE_URL}/bff/files/scan-receipt?workspaceIdOrSlug=${encodeURIComponent(slug)}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ imagesBase64: [base64Image] }),
			},
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		const results: (ReceiptData | null)[] = data.data;
		return results[0] ?? null;
	} catch (error) {
		console.error("[ReceiptWorker] Receipt scan error:", error);
		throw error instanceof Error ? error : new Error("Unknown error during receipt scan");
	}
}

self.onmessage = async (event: MessageEvent<WorkerRequest<ReceiptScanInput>>) => {
	const { jobId, input } = event.data;

	try {
		const result = await scanReceipt(input.workspaceSlug, input.encodedBase64);
		const response: WorkerResponse<ReceiptData | null> = {
			jobId,
			result,
		};
		self.postMessage(response);
	} catch (error) {
		console.error("[ReceiptWorker] Job failed:", jobId, error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error during scan";
		const response: WorkerResponse<ReceiptData | null> = {
			jobId,
			error: errorMessage,
		};
		self.postMessage(response);
	}
};
