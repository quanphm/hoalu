export const MAX_UPLOAD_FILE_SIZE = 5 * 1024 * 1024; // 5 MiB

export function getS3Path(originalPath: string) {
	const hasS3Protocol = originalPath.startsWith("s3://");
	return hasS3Protocol ? originalPath : `s3://${originalPath}`;
}

/**
 * Check upload file type based on `accept` attribute in `input`.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#unique_file_type_specifiers
 */
export function isValidFileType(fileName: string, type: string) {
	if (!type && !fileName) return false;

	// accept: image/*
	if (type.startsWith("image/")) return "image";

	// accept: pdf
	if (type === "application/pdf") return "pdf";

	// If the MIME type is empty or not detected, use file extension
	if (!type || type === "") {
		if (fileName.endsWith(".pdf")) return "pdf";
	}

	return false;
}
