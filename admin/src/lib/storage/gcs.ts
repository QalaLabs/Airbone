import { Storage } from "@google-cloud/storage";
import { promises as fs } from "node:fs";
import nodePath from "node:path";
import { AppError, StorageUnavailableError } from "@/lib/utils/errors";
import { buildLocalUploadQuery } from "@/lib/storage/local-upload-token";

const GCS_BUCKET = process.env.GCS_BUCKET ?? "airborne-aviation-media-prod";

const SAFE_KEY = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/;

function assertSafeKey(path: string): void {
  if (!SAFE_KEY.test(path) || path.split("/").some((seg) => seg === "" || seg === "." || seg === "..")) {
    throw new AppError("INVALID_STORAGE_KEY", "Invalid storage object key", 400);
  }
}

function getAppBaseUrl(): string {
  const raw =
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:4000";
  return raw.replace(/\/$/, "");
}

function hasGcsCredentials(): boolean {
  return Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim() ||
      process.env.GCS_SERVICE_ACCOUNT_JSON?.trim(),
  );
}

/** True when uploads/deletes should hit Google Cloud Storage (not the local filesystem driver). */
function usesGcsRemoteStorage(): boolean {
  if (process.env.STORAGE_DRIVER === "local") return false;
  if (process.env.STORAGE_LOCAL_DIR?.trim()) return false;
  if (process.env.STORAGE_DRIVER === "gcs") return true;
  if (hasGcsCredentials()) return true;
  if (process.env.NODE_ENV === "production") return true;
  return false;
}

function resolveLocalStorageDir(): string | null {
  const explicit = process.env.STORAGE_LOCAL_DIR?.trim();
  if (explicit) return nodePath.resolve(explicit);
  if (process.env.STORAGE_DRIVER === "local") {
    return nodePath.resolve(process.cwd(), ".data", "local-media");
  }
  if (!usesGcsRemoteStorage()) {
    return nodePath.resolve(process.cwd(), ".data", "local-media");
  }
  return null;
}

let cachedLocalDir: string | null | undefined;
let loggedLocalDriver = false;

/** Filesystem driver for local dev / E2E; set STORAGE_LOCAL_DIR or run dev without GCS credentials. */
export function localStorageDir(): string | null {
  if (cachedLocalDir === undefined) {
    cachedLocalDir = resolveLocalStorageDir();
    if (cachedLocalDir && !loggedLocalDriver) {
      loggedLocalDriver = true;
      console.info(`[storage] Using local filesystem media storage at ${cachedLocalDir}`);
    }
  }
  return cachedLocalDir;
}

export function isLocalStorageDriver(): boolean {
  return localStorageDir() !== null;
}

function localObjectPath(path: string): string {
  assertSafeKey(path);
  const root = nodePath.resolve(localStorageDir()!);
  const full = nodePath.resolve(root, path);
  if (!full.startsWith(root + nodePath.sep)) {
    throw new AppError("INVALID_STORAGE_KEY", "Invalid storage object key", 400);
  }
  return full;
}

async function ensureLocalRoot(): Promise<void> {
  const root = localStorageDir();
  if (!root) return;
  await fs.mkdir(root, { recursive: true });
}

let storageClient: Storage | null = null;

function getStorageClient(): Storage {
  if (!storageClient) {
    storageClient = new Storage();
  }
  return storageClient;
}

export function isStorageConfigured(): boolean {
  if (isLocalStorageDriver()) return true;
  if (usesGcsRemoteStorage()) return true;
  return false;
}

export function storageBucketName(): string {
  return GCS_BUCKET;
}

const HEALTH_TTL_MS = 5 * 60 * 1000;
let healthCache: { at: number; result: { ok: boolean; error?: string } } | null = null;

export async function checkStorageHealth(): Promise<{ ok: boolean; error?: string }> {
  if (healthCache && Date.now() - healthCache.at < HEALTH_TTL_MS) return healthCache.result;

  let result: { ok: boolean; error?: string };
  if (isLocalStorageDriver()) {
    try {
      await ensureLocalRoot();
      result = { ok: true };
    } catch (err: unknown) {
      result = { ok: false, error: err instanceof Error ? err.message : "unknown error" };
    }
  } else {
    try {
      await getStorageClient().bucket(GCS_BUCKET).getFiles({ maxResults: 1, autoPaginate: false });
      result = { ok: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "unknown error";
      result = { ok: false, error: message };
    }
  }

  healthCache = { at: Date.now(), result };
  return result;
}

export function getPublicUrl(path: string): string {
  assertSafeKey(path);
  if (isLocalStorageDriver()) {
    const encoded = path
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    return `${getAppBaseUrl()}/api/v1/media/objects/${encoded}`;
  }
  return `https://storage.googleapis.com/${GCS_BUCKET}/${path}`;
}

export async function uploadObject(
  path: string,
  data: Uint8Array,
  contentType: string,
): Promise<string> {
  if (!isStorageConfigured()) {
    throw new StorageUnavailableError(
      "Media storage is not configured. Set GOOGLE_APPLICATION_CREDENTIALS for GCS, or use local dev storage (automatic when GCS is not configured).",
    );
  }

  if (isLocalStorageDriver()) {
    try {
      await ensureLocalRoot();
      const full = localObjectPath(path);
      await fs.mkdir(nodePath.dirname(full), { recursive: true });
      await fs.writeFile(full, Buffer.from(data));
      return getPublicUrl(path);
    } catch (err: unknown) {
      if (err instanceof AppError) throw err;
      const message = err instanceof Error ? err.message : String(err);
      throw new AppError("UPLOAD_FAILED", `Storage upload failed: ${message}`, 502);
    }
  }

  try {
    const bucket = getStorageClient().bucket(GCS_BUCKET);
    const file = bucket.file(path);
    await file.save(Buffer.from(data), {
      metadata: { contentType },
      resumable: false,
    });
    return getPublicUrl(path);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new AppError("UPLOAD_FAILED", `Storage upload failed: ${message}`, 502);
  }
}

export async function createSignedUploadUrl(
  path: string,
  contentType: string,
  expiresIn = 900,
): Promise<string> {
  assertSafeKey(path);

  if (isLocalStorageDriver()) {
    const { exp, sig } = buildLocalUploadQuery(path, contentType, expiresIn);
    const params = new URLSearchParams({
      key: path,
      contentType,
      exp: String(exp),
      sig,
    });
    return `${getAppBaseUrl()}/api/v1/media/local-upload?${params.toString()}`;
  }

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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new AppError("UPLOAD_FAILED", `Storage presign failed: ${message}`, 502);
  }
}

export async function readLocalObject(path: string): Promise<Buffer | null> {
  if (!isLocalStorageDriver()) return null;
  try {
    await ensureLocalRoot();
    return await fs.readFile(localObjectPath(path));
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code === "ENOENT") return null;
    throw err;
  }
}

export async function createSignedReadUrl(path: string, fileName: string, expiresIn = 300): Promise<string> {
  assertSafeKey(path);
  if (isLocalStorageDriver()) {
    return getPublicUrl(path);
  }
  try {
    const [url] = await getStorageClient()
      .bucket(GCS_BUCKET)
      .file(path)
      .getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + expiresIn * 1000,
        responseDisposition: `inline; filename="${fileName.replace(/["\\\r\n]/g, "_")}"`,
      });
    return url;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new AppError("DOWNLOAD_FAILED", `Storage signed read failed: ${message}`, 502);
  }
}

function isDevGcsCredentialError(message: string): boolean {
  return /credentials|Could not load the default/i.test(message);
}

export async function deleteObject(path: string): Promise<void> {
  if (isLocalStorageDriver()) {
    try {
      await fs.unlink(localObjectPath(path));
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException)?.code;
      if (code !== "ENOENT") {
        const message = err instanceof Error ? err.message : String(err);
        throw new AppError("UPLOAD_FAILED", `Storage delete failed: ${message}`, 502);
      }
    }
    return;
  }

  try {
    const bucket = getStorageClient().bucket(GCS_BUCKET);
    await bucket.file(path).delete();
  } catch (err: unknown) {
    const anyErr = err as { code?: number; message?: string };
    if (anyErr.code === 404) return;
    const message = anyErr.message ?? String(err);
    if (process.env.NODE_ENV === "development" && isDevGcsCredentialError(message)) {
      console.warn(`[storage] Dev: skipping GCS delete for ${path} (no credentials). Removing DB record only.`);
      return;
    }
    throw new AppError("UPLOAD_FAILED", `Storage delete failed: ${message}`, 502);
  }
}

export function guessContentTypeFromKey(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    pdf: "application/pdf",
    mp3: "audio/mpeg",
    wav: "audio/wav",
  };
  return map[ext] ?? "application/octet-stream";
}
