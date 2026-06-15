import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import type { LeadSource } from "@prisma/client";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { generateResourceToken } from "@/lib/utils/resource-token";

const SOURCE_MAP: Record<string, LeadSource> = {
  homepage_cta: "HOMEPAGE_CTA",
  contact_form: "CONTACT_FORM",
  brochure_download: "BROCHURE_DOWNLOAD",
  course_page: "COURSE_PAGE",
};

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-intake-key");
  if (!process.env.PUBLIC_INTAKE_KEY || apiKey !== process.env.PUBLIC_INTAKE_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 5 requests per minute per IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const { allowed, remaining, resetAt } = checkRateLimit(`lead:${ip}`, 5, 60_000);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
        },
      },
    );
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { name, email, phone, courseInterest, source } = body as {
      name?: string;
      email?: string;
      phone?: string;
      courseInterest?: string;
      source?: string;
    };

    if (!name || !phone) {
      return NextResponse.json({ error: "name and phone are required" }, { status: 400 });
    }

    const org = await prisma.organization.findFirst({
      where: { slug: process.env.PUBLIC_ORG_SLUG ?? "airborne-aviation" },
      select: { id: true },
    });

    if (!org) {
      console.error("[Public Lead] Org not found:", process.env.PUBLIC_ORG_SLUG);
      return NextResponse.json({ error: "Academy configuration missing" }, { status: 500 });
    }

    const normalizedPhone = String(phone).trim();
    const leadSource: LeadSource = SOURCE_MAP[source?.toLowerCase() ?? ""] ?? "HOMEPAGE_CTA";

    // Dedup check: same phone in this org
    const existing = await prisma.lead.findFirst({
      where: { phone: normalizedPhone, orgId: org.id, deletedAt: null },
      select: { id: true },
    });

    const lead = await prisma.lead.create({
      data: {
        name: String(name).trim(),
        email: email ? String(email).trim() : null,
        phone: normalizedPhone,
        courseInterest: courseInterest ? String(courseInterest).trim() : null,
        source: leadSource,
        orgId: org.id,
        isDuplicate: !!existing,
        ...(existing ? { duplicateOf: existing.id } : {}),
        customFields: { webSource: source ?? "website" },
      },
      select: { id: true, name: true, createdAt: true },
    });

    // Issue a short-lived token granting access to gated resources
    const gateToken = generateResourceToken(normalizedPhone);

    return NextResponse.json(
      {
        success: true,
        data: lead,
        gateToken,
        meta: { "X-RateLimit-Remaining": String(remaining) },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[Public Lead API Error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
