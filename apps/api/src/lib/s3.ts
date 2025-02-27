import { S3Client } from "bun";

export const bunS3Client = new S3Client({
	accessKeyId: process.env.S3_ACCESS_KEY_ID,
	secretAccessKey: process.env.S3_SECRET_KEY,
	bucket: process.env.S3_BUCKET,
	endpoint: process.env.S3_ENDPOINT,
});
