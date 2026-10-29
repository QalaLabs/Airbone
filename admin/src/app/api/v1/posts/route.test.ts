import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { postSchema, authenticatePostApi, POST, GET } from "./route";
import { sanitizeHtml } from "@/lib/cms/safe-content";
import { prisma } from "@/lib/db/client";

test("posts api schema validation", () => {
  // Title min 3 chars
  assert.equal(postSchema.safeParse({ title: "Hi" }).success, false);
  assert.equal(postSchema.safeParse({ title: "Valid Post Title" }).success, true);

  // Slug regex
  assert.equal(postSchema.safeParse({ title: "Valid", slug: "INVALID SLUG!" }).success, false);
  assert.equal(postSchema.safeParse({ title: "Valid", slug: "valid-post-slug-123" }).success, true);

  // Status enum
  assert.equal(postSchema.safeParse({ title: "Valid", status: "NOT_A_STATUS" }).success, false);
  assert.equal(postSchema.safeParse({ title: "Valid", status: "PUBLISHED" }).success, true);
  assert.equal(postSchema.safeParse({ title: "Valid", status: "draft" }).success, true);
});

test("posts api authentication with environment key", async () => {
  const origKey = process.env.BLOG_API_KEY;
  process.env.BLOG_API_KEY = "test-secret-blog-key-123";

  try {
    // 1. Missing auth
    const req1 = new NextRequest("http://localhost/api/v1/posts");
    const auth1 = await authenticatePostApi(req1, "fake-org-id");
    assert.equal(auth1.authenticated, false);

    // 2. Invalid auth
    const req2 = new NextRequest("http://localhost/api/v1/posts", {
      headers: { authorization: "Bearer wrong-key" },
    });
    const auth2 = await authenticatePostApi(req2, "fake-org-id");
    assert.equal(auth2.authenticated, false);

    // 3. Valid bearer token
    const req3 = new NextRequest("http://localhost/api/v1/posts", {
      headers: { authorization: "Bearer test-secret-blog-key-123" },
    });
    const auth3 = await authenticatePostApi(req3, "fake-org-id");
    assert.equal(auth3.authenticated, true);
    assert.equal(auth3.method, "env_key");

    // 4. Valid x-api-key header
    const req4 = new NextRequest("http://localhost/api/v1/posts", {
      headers: { "x-api-key": "test-secret-blog-key-123" },
    });
    const auth4 = await authenticatePostApi(req4, "fake-org-id");
    assert.equal(auth4.authenticated, true);
  } finally {
    process.env.BLOG_API_KEY = origKey;
  }
});

test("posts api HTML sanitization on ingestion", () => {
  const unsafeHtml = `
    <h2>Complete Guide to Flight Training</h2>
    <script>window.location="https://malicious.example"</script>
    <p onmouseover="alert('xss')">Welcome! Check our <a href="javascript:stealCookie()">link</a>.</p>
    <table>
      <thead>
        <tr><th>Stage</th><th>Hours</th></tr>
      </thead>
      <tbody>
        <tr><td>SPL</td><td>10 hrs</td></tr>
        <tr><td>PPL</td><td>40 hrs</td></tr>
      </tbody>
    </table>
  `;

  const clean = sanitizeHtml(unsafeHtml);

  // Script and dangerous handlers removed
  assert.ok(!clean.includes("<script>"));
  assert.ok(!clean.includes("malicious.example"));
  assert.ok(!clean.includes("onmouseover"));
  assert.ok(!clean.includes("javascript:"));

  // Headings, paragraphs, and tables preserved
  assert.ok(clean.includes("<h2>Complete Guide to Flight Training</h2>"));
  assert.ok(clean.includes("<table>"));
  assert.ok(clean.includes("<thead>"));
  assert.ok(clean.includes("<tr><th>Stage</th><th>Hours</th></tr>"));
  assert.ok(clean.includes("<tbody>"));
  assert.ok(clean.includes("<tr><td>SPL</td><td>10 hrs</td></tr>"));
});

test("POST /api/v1/posts rejects unauthorized requests with 401", async () => {
  const req = new NextRequest("http://localhost/api/v1/posts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "My Test Blog" }),
  });

  const res = await POST(req);
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.equal(data.error.code, "UNAUTHORIZED");
});

test("POST /api/v1/posts rejects invalid schema with 400", async () => {
  const origKey = process.env.BLOG_API_KEY;
  process.env.BLOG_API_KEY = "test-key";

  // Mock org findFirst
  const origFindOrg = prisma.organization.findFirst;
  prisma.organization.findFirst = (async () => ({ id: "mock-org-id" })) as any;

  try {
    const req = new NextRequest("http://localhost/api/v1/posts", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer test-key",
      },
      body: JSON.stringify({ title: "A" }), // Too short
    });

    const res = await POST(req);
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error.code, "VALIDATION_ERROR");
  } finally {
    prisma.organization.findFirst = origFindOrg;
    process.env.BLOG_API_KEY = origKey;
  }
});

test("POST /api/v1/posts handles duplicate slugs: 409 conflict vs updateIfExists", async () => {
  const origKey = process.env.BLOG_API_KEY;
  process.env.BLOG_API_KEY = "test-key";

  const origFindOrg = prisma.organization.findFirst;
  const origFindResource = prisma.resource.findFirst;
  const origUpdateResource = prisma.resource.update;
  const origCreateResource = prisma.resource.create;

  prisma.organization.findFirst = (async () => ({ id: "mock-org-id" })) as any;
  prisma.resource.findFirst = (async () => ({
    id: "existing-res-id",
    orgId: "mock-org-id",
    title: "Existing Post",
    slug: "my-pilot-guide",
    description: "Old desc",
    status: "DRAFT",
    metadata: { bodyHtml: "<p>Old body</p>" },
  })) as any;

  let updateCalled = false;
  prisma.resource.update = (async ({ data }: any) => {
    updateCalled = true;
    return {
      id: "existing-res-id",
      title: data.title,
      slug: "my-pilot-guide",
      description: data.description,
      status: data.status,
      category: data.category,
      tags: data.tags,
      seoTitle: data.seoTitle,
      seoDesc: data.seoDesc,
      publishedAt: data.publishedAt,
      metadata: data.metadata,
    };
  }) as any;

  try {
    // 1. Without updateIfExists -> 409 Conflict
    const req1 = new NextRequest("http://localhost/api/v1/posts", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer test-key",
      },
      body: JSON.stringify({
        title: "New Post Title",
        slug: "my-pilot-guide",
        bodyHtml: "<p>New Body</p>",
      }),
    });

    const res1 = await POST(req1);
    assert.equal(res1.status, 409);
    const data1 = await res1.json();
    assert.equal(data1.success, false);
    assert.equal(data1.error.code, "CONFLICT");

    // 2. With updateIfExists: true -> 200 OK
    const req2 = new NextRequest("http://localhost/api/v1/posts", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer test-key",
      },
      body: JSON.stringify({
        title: "Updated Post Title",
        slug: "my-pilot-guide",
        bodyHtml: "<p>New Body</p>",
        updateIfExists: true,
      }),
    });

    const res2 = await POST(req2);
    assert.equal(res2.status, 200);
    const data2 = await res2.json();
    assert.equal(data2.success, true);
    assert.equal(data2.data.title, "Updated Post Title");
    assert.equal(updateCalled, true);
  } finally {
    prisma.organization.findFirst = origFindOrg;
    prisma.resource.findFirst = origFindResource;
    prisma.resource.update = origUpdateResource;
    prisma.resource.create = origCreateResource;
    process.env.BLOG_API_KEY = origKey;
  }
});

test("POST /api/v1/posts creates a published post directly and triggers revalidation", async () => {
  const origKey = process.env.BLOG_API_KEY;
  const origRevUrl = process.env.WEBSITE_REVALIDATE_URL;
  const origRevSec = process.env.WEBSITE_REVALIDATE_SECRET;
  const origFetch = globalThis.fetch;

  process.env.BLOG_API_KEY = "test-key";
  process.env.WEBSITE_REVALIDATE_URL = "https://website.local/api/revalidate";
  process.env.WEBSITE_REVALIDATE_SECRET = "test-secret";

  let revalidateFetchCalled = false;
  let revalidatePayload: any = null;
  globalThis.fetch = (async (url: any, init: any) => {
    if (String(url).includes("/api/revalidate")) {
      revalidateFetchCalled = true;
      revalidatePayload = JSON.parse(String(init.body));
      return new Response(JSON.stringify({ revalidated: true }), { status: 200 });
    }
    return new Response("{}", { status: 200 });
  }) as any;

  const origFindOrg = prisma.organization.findFirst;
  const origFindResource = prisma.resource.findFirst;
  const origCreateResource = prisma.resource.create;

  prisma.organization.findFirst = (async () => ({ id: "mock-org-id" })) as any;
  prisma.resource.findFirst = (async () => null) as any;

  let createdData: any = null;
  prisma.resource.create = (async ({ data }: any) => {
    createdData = data;
    return {
      id: "new-post-uuid",
      title: data.title,
      slug: data.slug,
      description: data.description,
      status: data.status,
      category: data.category,
      tags: data.tags,
      seoTitle: data.seoTitle,
      seoDesc: data.seoDesc,
      publishedAt: data.publishedAt,
      metadata: data.metadata,
    };
  }) as any;

  try {
    const req = new NextRequest("http://localhost/api/v1/posts", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer test-key",
      },
      body: JSON.stringify({
        title: "How to Clear DGCA Ground School",
        slug: "dgca-ground-school-exam-prep",
        bodyHtml: "<h2>Study Tips</h2><p>Focus on Navigation and Meteorology.</p>",
        status: "PUBLISHED",
        tags: ["DGCA", "Ground School"],
        category: "DGCA Exams",
        author: "Capt. Navrang Singh",
      }),
    });

    const res = await POST(req);
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.slug, "dgca-ground-school-exam-prep");
    assert.equal(body.data.status, "PUBLISHED");
    assert.equal(body.data.revalidated, true);
    assert.equal(revalidateFetchCalled, true);
    assert.deepEqual(revalidatePayload.resources, ["resources", "blogs"]);
    assert.deepEqual(revalidatePayload.paths, [
      "/blog",
      "/blog/dgca-ground-school-exam-prep",
      "/sitemap.xml",
    ]);
  } finally {
    prisma.organization.findFirst = origFindOrg;
    prisma.resource.findFirst = origFindResource;
    prisma.resource.create = origCreateResource;
    process.env.BLOG_API_KEY = origKey;
    process.env.WEBSITE_REVALIDATE_URL = origRevUrl;
    process.env.WEBSITE_REVALIDATE_SECRET = origRevSec;
    globalThis.fetch = origFetch;
  }
});
