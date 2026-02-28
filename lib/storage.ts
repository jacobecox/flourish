import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import sharp from "sharp";

// Cloudflare R2 is S3-compatible. `region: "auto"` is required by R2 instead of a standard AWS region name.
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.STORAGE_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
  },
});

const MAX_DIMENSION = 2048;
const WEBP_QUALITY = 85;

export async function uploadFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const processed = await sharp(buffer)
    .resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: "inside",           // preserve aspect ratio
      withoutEnlargement: true, // never upscale small images
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  // Timestamp prefix keeps objects sorted chronologically in the bucket; random suffix prevents collisions.
  const key = `photos/${Date.now()}-${crypto.randomBytes(8).toString("hex")}.webp`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.STORAGE_BUCKET!,
      Key: key,
      Body: processed,
      ContentType: "image/webp",
    })
  );

  return `${process.env.STORAGE_PUBLIC_URL}/${key}`;
}
