/**
 * Final RC smoke against latest Preview URLs.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const adminBypass = fs.readFileSync(path.join(root, "admin/.vercel-bypass-secret"), "utf8").trim();
const mktBypass = fs.readFileSync(path.join(root, ".vercel-bypass-secret"), "utf8").trim();
const adminBase = fs.readFileSync(path.join(root, "admin-preview-url.txt"), "utf8").trim();
const mktBase = process.env.MKT_PREVIEW || "https://airbone-m6zkqr6af-qala-labs-projects.vercel.app";

function withBypass(url, bypass) {
  const u = new URL(url);
  u.searchParams.set("x-vercel-protection-bypass", bypass);
  u.searchParams.set("x-vercel-set-bypass-cookie", "true");
  return u.toString();
}

async function get(label, url, bypass) {
  try {
    const res = await fetch(withBypass(url, bypass), {
      headers: { "x-vercel-protection-bypass": bypass },
      redirect: "follow",
    });
    const text = await res.text();
    console.log(
      JSON.stringify({
        label,
        status: res.status,
        host: new URL(res.url).host,
        len: text.length,
        loginUI: /type=["']password["']/i.test(text),
        airborne: /Airborne|aviation/i.test(text),
        notFound: res.status === 404,
        sso: /sso-api/i.test(text),
      }),
    );
  } catch (e) {
    console.log(JSON.stringify({ label, err: e.message }));
  }
}

console.log(JSON.stringify({ adminBase, mktBase }));

for (const [p, label] of [
  ["/login", "admin.login"],
  ["/dev/auto-login", "admin.dev404"],
  ["/verify/VERIFY-NAV-0001", "admin.cert"],
  ["/api/auth/csrf", "admin.csrf"],
  ["/api/v1/lms/me", "admin.lmsMeUnauth"],
]) {
  await get(label, adminBase + p, adminBypass);
}

for (const [p, label] of [
  ["/", "mkt.home"],
  ["/courses", "mkt.courses"],
  ["/contact", "mkt.contact"],
  ["/dev", "mkt.dev404"],
  ["/dev/auto-login", "mkt.devAuto404"],
]) {
  await get(label, mktBase + p, mktBypass);
}

const leadRes = await fetch(withBypass(mktBase + "/api/lead", mktBypass), {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-vercel-protection-bypass": mktBypass,
  },
  body: JSON.stringify({
    name: "RC Final Lead",
    email: `rc.final.${Date.now()}@example.com`,
    phone: "9876501234",
    course: "CPL Ground School",
    message: "RC final smoke — discard",
    source: "contact form",
  }),
});
const leadBody = await leadRes.text();
console.log(JSON.stringify({ label: "mkt.leadPost", status: leadRes.status, body: leadBody.slice(0, 200) }));

// Auth + portal/faculty/lms after login
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
  absorb(
    await fetch(withBypass(adminBase + "/login", adminBypass), {
      headers: { "x-vercel-protection-bypass": adminBypass },
    }),
  );
  const csrfRes = await fetch(withBypass(adminBase + "/api/auth/csrf", adminBypass), {
    headers: { "x-vercel-protection-bypass": adminBypass, Cookie: hdr() },
  });
  absorb(csrfRes);
  const { csrfToken } = await csrfRes.json();
  const form = new URLSearchParams({
    csrfToken,
    email,
    password,
    orgSlug: "airborne-aviation",
    json: "true",
    callbackUrl: adminBase + "/",
  }).toString();
  let url = withBypass(adminBase + "/api/auth/callback/credentials", adminBypass);
  for (let i = 0; i < 4; i++) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-vercel-protection-bypass": adminBypass,
        Cookie: hdr(),
      },
      body: form,
      redirect: "manual",
    });
    absorb(res);
    const loc = res.headers.get("location");
    if (res.status === 307 && loc && /credentials/i.test(loc)) {
      url = withBypass(new URL(loc, adminBase).toString(), adminBypass);
      continue;
    }
    break;
  }
  return hdr;
}

const adminHdr = await login("admin@airborneaviation.in", "Admin@1234!");
for (const p of ["/lms", "/faculty", "/"]) {
  const res = await fetch(withBypass(adminBase + p, adminBypass), {
    headers: { "x-vercel-protection-bypass": adminBypass, Cookie: adminHdr() },
    redirect: "follow",
  });
  const text = await res.text();
  console.log(
    JSON.stringify({
      label: `adminAuthed.${p}`,
      status: res.status,
      host: new URL(res.url).host,
      loginUI: /type=["']password["']/i.test(text),
      len: text.length,
    }),
  );
}

const studentHdr = await login("demo.student@airborneaviation.in", "DemoStudent1!");
for (const p of ["/portal", "/api/v1/lms/me"]) {
  const res = await fetch(withBypass(adminBase + p, adminBypass), {
    headers: { "x-vercel-protection-bypass": adminBypass, Cookie: studentHdr() },
    redirect: "follow",
  });
  const text = await res.text();
  console.log(
    JSON.stringify({
      label: `studentAuthed.${p}`,
      status: res.status,
      host: new URL(res.url).host,
      loginUI: /type=["']password["']/i.test(text),
      okJson: /"success":true/.test(text),
      len: text.length,
      snippet: text.replace(/\s+/g, " ").slice(0, 120),
    }),
  );
}

console.log(JSON.stringify({ phase: "done" }));
