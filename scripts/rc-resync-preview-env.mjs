import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseEnv(raw) {
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[line.slice(0, i).trim()] = v;
  }
  return out;
}

function setPreview(cwd, key, value) {
  if (!value) {
    console.log(`${path.basename(cwd)} ${key}: SKIP empty`);
    return false;
  }
  spawnSync("npx", ["vercel", "env", "rm", key, "preview", "-y", "--scope", "qala-labs-projects"], {
    cwd,
    encoding: "utf8",
    shell: true,
  });
  const add = spawnSync(
    "npx",
    ["vercel", "env", "add", key, "preview", "--scope", "qala-labs-projects"],
    { cwd, input: value + "\n", encoding: "utf8", shell: true },
  );
  const ok = add.status === 0;
  console.log(
    `${path.basename(cwd)} ${key}: ${ok ? "OK" : "FAIL"} len=${value.length}` +
      (ok ? "" : ` ${(add.stderr || add.stdout || "").split("\n")[0]}`),
  );
  return ok;
}

const adminPreview = fs.readFileSync(path.join(root, "admin-preview-url.txt"), "utf8").trim();
const mktPreview = "https://airbone-h99h66p7h-qala-labs-projects.vercel.app";

const adminLocal = parseEnv(fs.readFileSync(path.join(root, "admin/.env"), "utf8"));
const mktLocal = parseEnv(fs.readFileSync(path.join(root, ".env.local"), "utf8"));

console.log(JSON.stringify({ adminPreview, mktPreview, action: "resync-preview-env" }));

// Admin Preview — core
const adminCwd = path.join(root, "admin");
const adminPairs = [
  ["DATABASE_URL", adminLocal.DATABASE_URL],
  ["DIRECT_URL", adminLocal.DIRECT_URL],
  ["AUTH_SECRET", adminLocal.AUTH_SECRET],
  ["AUTH_URL", adminPreview],
  ["AUTH_TRUST_HOST", "true"],
  ["NEXT_PUBLIC_APP_URL", adminPreview],
  ["NEXT_PUBLIC_APP_NAME", adminLocal.NEXT_PUBLIC_APP_NAME || "Airborne Admin"],
  ["PUBLIC_INTAKE_KEY", adminLocal.PUBLIC_INTAKE_KEY],
  ["PUBLIC_ORG_SLUG", adminLocal.PUBLIC_ORG_SLUG || "airborne-aviation"],
  ["NODE_ENV", "production"],
];
for (const [k, v] of adminPairs) setPreview(adminCwd, k, v);

// Marketing Preview — point at admin Preview (with bypass won't help server-to-server!)
// Server-side fetch from marketing→admin needs either unprotected API or shared secret path.
// Public leads API is not SSO-gated if Vercel protection applies to all routes — CRITICAL.
// Test: marketing serverless cannot send x-vercel-protection-bypass unless we bake it into ADMIN fetch.
// For RC: set ADMIN_API_URL to admin preview; if protection blocks, lead stays on fallback.
const adminBypassPath = path.join(root, "admin/.vercel-bypass-secret");
const adminBypass = fs.existsSync(adminBypassPath)
  ? fs.readFileSync(adminBypassPath, "utf8").trim()
  : "";

const mktPairs = [
  ["ADMIN_API_URL", adminPreview],
  ["PUBLIC_INTAKE_KEY", mktLocal.PUBLIC_INTAKE_KEY || adminLocal.PUBLIC_INTAKE_KEY],
  ["SUPABASE_URL", mktLocal.SUPABASE_URL],
  ["SUPABASE_ANON_KEY", mktLocal.SUPABASE_ANON_KEY],
  ["ADMIN_PROTECTION_BYPASS", adminBypass],
];
for (const [k, v] of mktPairs) setPreview(root, k, v);

console.log(JSON.stringify({ phase: "done-resync" }));
