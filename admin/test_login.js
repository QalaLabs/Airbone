async function testLogin() {
  console.log("[1] Fetching CSRF token from /api/auth/csrf...");
  const csrfRes = await fetch("http://localhost:4000/api/auth/csrf");
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;
  const cookies = csrfRes.headers.getSetCookie();
  const cookieMap = {};
  for (const c of cookies) {
    const part = c.split(";")[0];
    const [name, ...val] = part.split("=");
    cookieMap[name] = val.join("=");
  }
  const cookieHeader = Object.entries(cookieMap).map(([k, v]) => `${k}=${v}`).join("; ");

  console.log("Raw CSRF Cookies:", cookies);
  console.log("Cookie Header Sent:", cookieHeader);
  console.log("CSRF Token:", csrfToken);

  console.log("[2] Sending login credentials to /api/auth/callback/credentials...");
  const formData = new URLSearchParams();
  formData.append("orgSlug", "airborne-aviation");
  formData.append("email", "superadmin@airborne.academy");
  formData.append("password", "Airborne@123");
  formData.append("csrfToken", csrfToken);
  formData.append("json", "true");

  const loginRes = await fetch("http://localhost:4000/api/auth/callback/credentials", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookieHeader
    },
    body: formData.toString(),
    redirect: "manual"
  });

  console.log("Login Response Status:", loginRes.status);
  console.log("Login Location Header:", loginRes.headers.get("Location"));
  console.log("All Login Headers:", Object.fromEntries(loginRes.headers.entries()));
  const loginCookies = loginRes.headers.getSetCookie();
  console.log("Set-Cookie headers:", loginCookies);

  let sessionCookie = "";
  for (const cookie of loginCookies) {
    if (cookie.includes("authjs.session-token") || cookie.includes("next-auth.session-token")) {
      sessionCookie = cookie.split(";")[0];
    }
  }

  if (!sessionCookie) {
    console.error("❌ Login failed! No session token received.");
    const body = await loginRes.text();
    console.error("Body:", body);
    process.exit(1);
  }

  console.log("✅ Successfully received session cookie:", sessionCookie);

  console.log("[3] Verifying authenticated access to /api/v1/leads...");
  const leadsRes = await fetch("http://localhost:4000/api/v1/leads?page=1&limit=5", {
    headers: {
      "Cookie": sessionCookie
    }
  });

  console.log("Leads API Response Status:", leadsRes.status);
  const leadsData = await leadsRes.json();
  console.log("Leads Data:", JSON.stringify(leadsData, null, 2));

  if (leadsRes.status === 200 && leadsData.success !== false) {
    console.log("🎉 Successfully verified end-to-end authentication and API access!");
  } else {
    console.error("❌ Failed to access protected API endpoint.");
    process.exit(1);
  }
}

testLogin().catch(err => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
