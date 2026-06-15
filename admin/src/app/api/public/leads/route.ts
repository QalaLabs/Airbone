import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import type { LeadSource } from "@prisma/client";

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

    const leadSource: LeadSource = SOURCE_MAP[source?.toLowerCase() ?? ""] ?? "HOMEPAGE_CTA";

    const lead = await prisma.lead.create({
      data: {
        name: String(name).trim(),
        email: email ? String(email).trim() : null,
        phone: String(phone).trim(),
        courseInterest: courseInterest ? String(courseInterest).trim() : null,
        source: leadSource,
        orgId: org.id,
        customFields: { webSource: source ?? "website" } as Record<string, unknown>,
      },
      select: { id: true, name: true, createdAt: true },
    });

    return NextResponse.json({ success: true, data: lead }, { status: 201 });
  } catch (err) {
    console.error("[Public Lead API Error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
