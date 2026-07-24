import fs from "fs";
import path from "path";

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

function classify(key, value, { allowLocal = false } = {}) {
  if (value == null) return "ABSENT";
  if (value === "") return "EMPTY";
  if (!allowLocal && /replace|your-|changeme|example\.com|password@/i.test(value)) {
    return `PLACEHOLDER(len=${value.length})`;
  }
  return `PRESENT(len=${value.length})`;
}

function report(label, filePath, keys, opts = {}) {
  console.log(`\n=== ${label} (${filePath}) ===`);
  const env = loadEnv(filePath);
  if (!env) {
    console.log("FILE_MISSING");
    return;
  }
  for (const k of keys) {
    console.log(`${k}=${classify(k, env[k], opts)}`);
  }
}

const root = process.cwd();
const adminEnv = path.join(root, "admin", ".env");
const rootEnvLocal = path.join(root, ".env.local");
const rootEnv = path.join(root, ".env");

report("ADMIN", adminEnv, [
  "DATABASE_URL",
  "DIRECT_URL",
  "AUTH_SECRET",
  "AUTH_URL",
  "PUBLIC_INTAKE_KEY",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_BUCKET_DOCS",
  "R2_PUBLIC_URL",
  "INNGEST_EVENT_KEY",
  "INNGEST_SIGNING_KEY",
  "GEMINI_API_KEY",
]);

const marketingFile = fs.existsSync(rootEnvLocal) ? rootEnvLocal : rootEnv;
report("MARKETING", marketingFile, [
  "ADMIN_API_URL",
  "PUBLIC_INTAKE_KEY",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "N8N_WHATSAPP_WEBHOOK",
  "VOICE_AI_WEBHOOK",
  "PUBLIC_ORG_SLUG",
  "NEXT_PUBLIC_ADMIN_URL",
]);
