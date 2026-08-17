import { Storage } from "@google-cloud/storage";
import { AppError } from "@/lib/utils/errors";

const GCS_BUCKET = process.env.GCS_BUCKET ?? "airborne-aviation-media-prod";

// Lazy initialize Storage client
let storageClient: Storage | null = null;

function getStorageClient(): Storage {
  if (!storageClient) {
    storageClient = new Storage();
  }
  return storageClient;
}

export function isStorageConfigured(): boolean {
  // GCS is assumed to be configured on Cloud Run using ambient credentials
  return true;
}

export function getPublicUrl(path: string): string {
  return `https://storage.googleapis.com/${GCS_BUCKET}/${path}`;
}

export async function uploadObject(
  path: string,
  data: Uint8Array,
  contentType: string,
): Promise<string> {
  try {
    const bucket = getStorageClient().bucket(GCS_BUCKET);
    const file = bucket.file(path);
    await file.save(Buffer.from(data), {
      metadata: { contentType },
      resumable: false,
    });
    return getPublicUrl(path);
  } catch (err: any) {
    throw new AppError("UPLOAD_FAILED", `Storage upload failed: ${err.message}`, 502);
  }
}

export async function createSignedUploadUrl(
  path: string,
  contentType: string,
  expiresIn = 900,
): Promise<string> {
  try {
    const bucket = getStorageClient().bucket(GCS_BUCKET);
    const file = bucket.file(path);
    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + expiresIn * 1000,
      contentType,
    });
    return url;
  } catch (err: any) {
    throw new AppError("UPLOAD_FAILED", `Storage presign failed: ${err.message}`, 502);
  }
}

export async function deleteObject(path: string): Promise<void> {
  try {
    const bucket = getStorageClient().bucket(GCS_BUCKET);
    const file = bucket.file(path);
    await file.delete();
  } catch (err: any) {
    if (err.code === 404) return;
    throw new AppError("UPLOAD_FAILED", `Storage delete failed: ${err.message}`, 502);
  }
}
