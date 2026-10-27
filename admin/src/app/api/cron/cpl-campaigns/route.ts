import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { cronAuthHttpStatus, verifyCronSecret } from "@/lib/automation/cron-auth";
import { getProvider } from "@/lib/messaging";
import { processCplDripLead, selectCplDrip, type CplDripLead } from "@/lib/crm/cpl-drip";

export async function GET(req: NextRequest) {
  return handleCron(req);
}

export async function POST(req: NextRequest) {
  return handleCron(req);
}

async function handleCron(req: NextRequest) {
  const auth = verifyCronSecret(req);
  if (!auth.ok) {
    return NextResponse.json(
      { error: "unauthorized", reason: auth.failure },
      { status: cronAuthHttpStatus(auth.failure) },
    );
  }

  const now = new Date();

  const orgs = await prisma.organization.findMany({
    select: { id: true, slug: true },
  });

  let totalProcessed = 0;
  const dispatched = {
    tier48h: 0,
    tier7d: 0,
    tier14d: 0,
  };

  const emailProvider = getProvider("EMAIL");
  const waProvider = getProvider("WHATSAPP");

  for (const org of orgs) {
    const leads = await prisma.lead.findMany({
      where: {
        orgId: org.id,
        deletedAt: null,
        status: { in: ["NEW", "INTERESTED", "NOT_CONNECTED", "FOLLOW_UP", "PROSPECT"] },
        OR: [
          { courseInterest: { contains: "cpl", mode: "insensitive" } },
          { courseInterest: { contains: "ground", mode: "insensitive" } },
          { courseInterest: { contains: "pilot", mode: "insensitive" } },
          { courseInterest: null },
        ],
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        courseInterest: true,
        tags: true,
        createdAt: true,
        lastActivityAt: true,
      },
    });

    totalProcessed += leads.length;

    for (const row of leads) {
      const lead: CplDripLead = {
        id: row.id,
        name: row.name,
        phone: row.phone,
        email: row.email,
        courseInterest: row.courseInterest,
        tags: row.tags ?? [],
        createdAt: row.createdAt,
        lastActivityAt: row.lastActivityAt,
      };
      const selection = selectCplDrip(lead, now);

      const outcome = await processCplDripLead(lead, now, {
        whatsappConfigured: waProvider.isConfigured(),
        emailConfigured: emailProvider.isConfigured(),
        sendWhatsApp: (l, s) =>
          waProvider.send({
            to: l.phone!,
            body: s.messageBody,
            templateName: `cpl_nurture_${s.tier}`,
            bodyValues: [l.name || "Student"],
            providerCampaignId: `cpl-drip-${s.tier}`,
          }),
        sendEmail: (l, s) =>
          emailProvider.send({
            to: l.email!,
            subject: s.subject,
            body: s.messageBody,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h3 style="color: #0f172a; margin-top: 0;">AIRBORNE AVIATION ACADEMY</h3>
                <p style="color: #0d9488; font-weight: bold; font-size: 13px; text-transform: uppercase;">${s.campaignTitle}</p>
                <p style="color: #334155; font-size: 14px; line-height: 1.5;">${s.messageBody}</p>
                <div style="margin: 20px 0;">
                  <a href="https://www.airborneaviation.in/courses/commercial-pilot-license-cpl" style="background-color: #db241e; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                    View Batch Schedule &amp; Syllabus
                  </a>
                </div>
                <p style="font-size: 12px; color: #64748b;">Dwarka, New Delhi &middot; Call: +91 9953 777 320</p>
              </div>
            `,
          }),
        // SMS-02: claim the tier BEFORE sending. Two overlapping cron runs can
        // therefore never deliver the same drip message twice.
        claimTag: async (leadId, tag) => {
          const claimed = await prisma.lead.updateMany({
            where: { id: leadId, orgId: org.id, NOT: { tags: { has: tag } } },
            data: { tags: { push: tag } },
          });
          return claimed.count > 0;
        },
        // Every provider failed: release the claim so a later run retries.
        releaseTag: async (leadId, tag) => {
          const fresh = await prisma.lead.findFirst({
            where: { id: leadId, orgId: org.id },
            select: { tags: true },
          });
          if (!fresh) return;
          await prisma.lead.updateMany({
            where: { id: leadId, orgId: org.id, tags: { has: tag } },
            data: { tags: { set: fresh.tags.filter((t) => t !== tag) } },
          });
        },
        logActivity: (l, s, channels) =>
          prisma.leadActivity.create({
            data: {
              orgId: org.id,
              leadId: l.id,
              activityType: "TASK",
              title: `CPL Inactivity Drip (${s.tier}): ${s.campaignTitle}`,
              notes: s.messageBody,
              metadata: {
                cron: "cpl-campaigns",
                tier: s.tier,
                tag: s.tag,
                channels,
                dispatchedAt: now.toISOString(),
              },
            },
          }),
      });

      if (outcome !== "sent" || !selection) continue;

      if (selection.tier === "48h") dispatched.tier48h++;
      if (selection.tier === "7d") dispatched.tier7d++;
      if (selection.tier === "14d") dispatched.tier14d++;
    }
  }

  return NextResponse.json({
    ok: true,
    timestamp: now.toISOString(),
    processedLeads: totalProcessed,
    dispatched,
  });
}
