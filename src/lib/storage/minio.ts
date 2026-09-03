import * as Minio from "minio";

export const minioClient = new Minio.Client({
  endPoint: process.env.S3_ENDPOINT || "localhost",
  port: parseInt(process.env.S3_PORT || "9000", 10),
  useSSL: process.env.S3_USE_SSL === "true",
  accessKey: process.env.S3_ACCESS_KEY || "minioadmin",
  secretKey: process.env.S3_SECRET_KEY || "minioadminpassword",
});

export const BUCKET_NAME = process.env.S3_BUCKET_NAME || "vibe-coder-workspace";

export async function ensureBucket() {
  const exists = await minioClient.bucketExists(BUCKET_NAME);
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME, "us-east-1");
  }
}
