/**
 * Sync selected keys from a pulled Vercel production env file into Preview.
 * Usage: node scripts/sync-env-to-preview.mjs <envFile> <cwdForVercel>
 * Never prints secret values.
 */
import fs from "fs";
import { spawnSync } from "child_process";
import path from "path";

const envFile = process.argv[2];
const cwd = process.argv[3] || process.cwd();

if (!envFile || !fs.existsSync(envFile)) {
  console.error("Usage: node scripts/sync-env-to-preview.mjs <envFile> [vercelCwd]");
  process.exit(1);
}

const ALLOW = new Set([
  "DATABASE_URL",
  "DIRECT_URL",
  "AUTH_SECRET",
  "AUTH_URL",
  "PUBLIC_INTAKE_KEY",
  "PUBLIC_ORG_SLUG",
  "ADMIN_API_URL",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_APP_NAME",
  "NODE_ENV",
]);

const SKIP_PREFIX = ["VERCEL_", "TURBO_", "NX_"];

function parseEnv(raw) {
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

const env = parseEnv(fs.readFileSync(envFile, "utf8"));
const keys = Object.keys(env).filter(
  (k) => ALLOW.has(k) && !SKIP_PREFIX.some((p) => k.startsWith(p)),
);

console.log(`Syncing ${keys.length} keys to Preview from ${path.basename(envFile)} (cwd=${cwd})`);

for (const key of keys) {
  const value = env[key];
  if (!value) {
    console.log(`${key}: SKIP empty`);
    continue;
  }
  // Remove existing preview var if present (ignore errors)
  spawnSync("vercel", ["env", "rm", key, "preview", "-y"], {
    cwd,
    encoding: "utf8",
    shell: true,
  });
  const add = spawnSync("vercel", ["env", "add", key, "preview"], {
    cwd,
    input: value + "\n",
    encoding: "utf8",
    shell: true,
  });
  if (add.status === 0) {
    console.log(`${key}: OK Preview (len=${value.length})`);
  } else {
    const err = (add.stderr || add.stdout || "").split("\n").slice(0, 3).join(" | ");
    console.log(`${key}: FAIL ${err}`);
  }
}
