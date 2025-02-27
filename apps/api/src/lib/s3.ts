import { S3Client } from "bun";
import * as Minio from "minio";

export const bunS3Client = new S3Client({
	accessKeyId: "d2b92c5633e2e575c5ce3d2a954d7dff",
	secretAccessKey: "9cd4a9ce4186804401af00c17691d8ed3e2bade2aae06068948eabf619b91733",
	bucket: "hoalu",
	endpoint: "https://0bf24896de5f0c3aa4bfdc722726cfec.r2.cloudflarestorage.com",
});

// @ts-ignore
Bun.s3 = bunS3Client;

export const minioS3Client = new Minio.Client({
	accessKey: process.env.S3_ACCESS_KEY_ID,
	secretKey: process.env.S3_SECRET_KEY,
	endPoint: process.env.S3_ENDPOINT,
});
