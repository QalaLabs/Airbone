import { createHmac, timingSafeEqual } from "node:crypto";

function signingSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) throw new Error("AUTH_SECRET is required for local upload URLs");
  return secret;
}

export function buildLocalUploadQuery(
  path: string,
  contentType: string,
  expiresInSeconds: number,
): { exp: number; sig: string } {
  const exp = Date.now() + expiresInSeconds * 1000;
  const payload = `${path}\0${contentType}\0${exp}`;
  const sig = createHmac("sha256", signingSecret()).update(payload).digest("hex");
  return { exp, sig };
}

export function verifyLocalUploadQuery(
  path: string,
  contentType: string,
  exp: number,
  sig: string,
): boolean {
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const payload = `${path}\0${contentType}\0${exp}`;
  const expected = createHmac("sha256", signingSecret()).update(payload).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}
