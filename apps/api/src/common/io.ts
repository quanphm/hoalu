export const MAX_UPLOAD_FILE_SIZE = 5 * 1024 * 1024; // 5 MiB

export function getS3Path(originalPath: string) {
	const hasS3Protocol = originalPath.startsWith("s3://");
	return hasS3Protocol ? originalPath : `s3://${originalPath}`;
}
