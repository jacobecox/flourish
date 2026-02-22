/**
 * Placeholder storage implementation — writes files to public/uploads/.
 *
 * To migrate to real object storage (Cloudflare R2, AWS S3, etc.):
 * 1. Replace the body of `uploadFile` with a presigned URL upload or SDK call.
 * 2. Return the public URL from the storage provider instead of a local path.
 * No other files need to change.
 */

import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function uploadFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  await writeFile(path.join(uploadsDir, filename), buffer);

  return `/uploads/${filename}`;
}
