/**
 * Role smoke: ADMIN / TEACHER / STUDENT against Admin Preview.
 * Never prints secrets.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bypass = fs.readFileSync(path.join(root, "admin/.vercel-bypass-secret"), "utf8").trim();
const base = fs.readFileSync(path.join(root, "admin-preview-url.txt"), "utf8").trim();

function wb(url) {
  const u = new URL(url);
  u.searchParams.set("x-vercel-protection-bypass", bypass);
  u.searchParams.set("x-vercel-set-bypass-cookie", "true");
  return u.toString();
}

async function login(email, password) {
  const cookies = new Map();
  const absorb = (res) => {
    for (const raw of res.headers.getSetCookie?.() || []) {
      const part = raw.split(";")[0];
      const i = part.indexOf("=");
      if (i > 0) cookies.set(part.slice(0, i), part.slice(i + 1));
    }
  };
  const hdr = () => [...cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  absorb(await fetch(wb(base + "/login"), { headers: { "x-vercel-protection-bypass": bypass } }));
  const csrfRes = await fetch(wb(base + "/api/auth/csrf"), {
    headers: { "x-vercel-protection-bypass": bypass, Cookie: hdr() },
  });
  absorb(csrfRes);
  const { csrfToken } = await csrfRes.json();
  const form = new URLSearchParams({
    csrfToken,
    email,
    password,
    orgSlug: "airborne-aviation",
    json: "true",
    callbackUrl: base + "/",
  }).toString();
  let url = wb(base + "/api/auth/callback/credentials");
  for (let i = 0; i < 4; i++) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-vercel-protection-bypass": bypass,
        Cookie: hdr(),
      },
      body: form,
      redirect: "manual",
    });
    absorb(res);
    const loc = res.headers.get("location");
    if (res.status === 307 && loc && /credentials/i.test(loc)) {
      url = wb(new URL(loc, base).toString());
      continue;
    }
    break;
  }
  const sess = await fetch(wb(base + "/api/auth/session"), {
    headers: { "x-vercel-protection-bypass": bypass, Cookie: hdr() },
  });
  const session = await sess.json();
  return { hdr, session };
}

const roles = [
  ["admin@airborneaviation.in", "Admin@1234!", "ADMIN", ["/lms", "/faculty", "/"]],
  ["demo.teacher@airborneaviation.in", "DemoTeacher1!", "TEACHER", ["/faculty", "/lms"]],
  ["demo.student@airborneaviation.in", "DemoStudent1!", "STUDENT", ["/portal", "/api/v1/lms/me"]],
];

for (const [email, password, expectRole, paths] of roles) {
  const { hdr, session } = await login(email, password);
  const role = session?.user?.role || null;
  const rows = [];
  for (const p of paths) {
    const res = await fetch(wb(base + p), {
      headers: { "x-vercel-protection-bypass": bypass, Cookie: hdr() },
      redirect: "follow",
    });
    const text = await res.text();
    rows.push({
      path: p,
      status: res.status,
      loginUI: /type=["']password["']/i.test(text),
      okJson: /"success"\s*:\s*true/.test(text),
    });
  }
  console.log(
    JSON.stringify({
      email,
      expectRole,
      gotRole: role,
      pass: role === expectRole,
      routes: rows,
    }),
  );
}
