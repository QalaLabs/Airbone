import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET() {
  try {
    const org = await prisma.organization.findFirst({
      where: { slug: process.env.PUBLIC_ORG_SLUG ?? "airborne-aviation" },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        domain: true,
        settings: true,
      },
    });

    if (!org) return NextResponse.json({ data: null });

    return NextResponse.json({ data: org });
  } catch (err) {
    console.error("[Public Settings API Error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
