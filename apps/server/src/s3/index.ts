import { S3Client } from "bun";
import * as Minio from "minio";

export const bunS3Client = new S3Client({
	accessKeyId: process.env.S3_ACCESS_KEY_ID,
	secretAccessKey: process.env.S3_SECRET_KEY,
	bucket: process.env.S3_BUCKET,
	endpoint: process.env.S3_ENDPOINT,
});

// @ts-ignore
Bun.s3 = bunS3Client;

export const minioS3Client = new Minio.Client({
	accessKey: process.env.S3_ACCESS_KEY_ID,
	secretKey: process.env.S3_SECRET_KEY,
	endPoint: process.env.S3_ENDPOINT,
});
