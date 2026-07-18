import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { guard } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { ok, handleError } from "@/lib/utils/response";
import { startOfDay, subDays } from "date-fns";

export async function GET() {
  try {
    const ctx = await getRequestContext();
    // Guard using general read permission for leads
    guard(ctx.user, "read", "leads");

    const orgId = ctx.orgId;
    const now = new Date();
    const todayStart = startOfDay(now);
    const sevenDaysAgo = subDays(now, 7);
    const thirtyDaysAgo = subDays(now, 30);

    // 1. Today's Leads
    const todayLeadsCount = await prisma.lead.count({
      where: { orgId, createdAt: { gte: todayStart }, deletedAt: null },
    });

    // 2. Weekly Leads
    const weeklyLeadsCount = await prisma.lead.count({
      where: { orgId, createdAt: { gte: sevenDaysAgo }, deletedAt: null },
    });

    // 3. Monthly Leads
    const monthlyLeadsCount = await prisma.lead.count({
      where: { orgId, createdAt: { gte: thirtyDaysAgo }, deletedAt: null },
    });

    // 4. Monthly Admissions
    const monthlyAdmissionsCount = await prisma.admission.count({
      where: { orgId, createdAt: { gte: thirtyDaysAgo } },
    });

    // 5. Total Revenue (last 30 days)
    const revenueSum = await prisma.paymentTransaction.aggregate({
      where: { orgId, status: "COMPLETED", createdAt: { gte: thirtyDaysAgo } },
      _sum: { amount: true },
    });
    const monthlyRevenue = Number(revenueSum._sum.amount ?? 0);

    // 6. Pending Follow-ups
    const pendingFollowUps = await prisma.lead.count({
      where: { orgId, status: "FOLLOW_UP", deletedAt: null },
    });

    // 7. Voice AI calls logged (activityType = CALL)
    const voiceAiCalls = await prisma.leadActivity.count({
      where: { orgId, activityType: "CALL", createdAt: { gte: thirtyDaysAgo } },
    });

    // 8. WhatsApp chats logged (activityType = WHATSAPP)
    const whatsappChats = await prisma.leadActivity.count({
      where: { orgId, activityType: "WHATSAPP", createdAt: { gte: thirtyDaysAgo } },
    });

    // 9. Active Counselors
    const activeCounselors = await prisma.user.count({
      where: { orgId, role: "ADMISSIONS_COUNSELOR", isActive: true, deletedAt: null },
    });
    const totalCounselors = await prisma.user.count({
      where: { orgId, role: "ADMISSIONS_COUNSELOR", deletedAt: null },
    });

    // 10. Placement Applications
    const placementApplications = await prisma.jobApplication.count({
      where: { orgId },
    });

    // 11. Lead Source distribution
    const sourceGroups = await prisma.lead.groupBy({
      by: ["source"],
      where: { orgId, deletedAt: null },
      _count: { source: true },
    });

    // 12. Conversion Funnel stages count
    const statusGroups = await prisma.lead.groupBy({
      by: ["status"],
      where: { orgId, deletedAt: null },
      _count: { status: true },
    });

    // 13. Course distribution counts
    const courseGroups = await prisma.lead.groupBy({
      by: ["courseInterest"],
      where: { orgId, deletedAt: null, NOT: { courseInterest: null } },
      _count: { courseInterest: true },
      orderBy: { _count: { courseInterest: "desc" } },
      take: 5,
    });

    return ok({
      todayLeads: todayLeadsCount,
      weeklyLeads: weeklyLeadsCount,
      monthlyLeads: monthlyLeadsCount,
      monthlyAdmissions: monthlyAdmissionsCount,
      monthlyRevenue,
      pendingFollowUps,
      voiceAiCalls,
      whatsappChats,
      activeCounselors: `${activeCounselors} / ${totalCounselors || 1}`,
      placementApplications,
      sourceDistribution: sourceGroups.map(g => ({
        source: g.source,
        count: g._count.source,
      })),
      funnelDistribution: statusGroups.map(g => ({
        status: g.status,
        count: g._count.status,
      })),
      courseDistribution: courseGroups.map(g => ({
        courseName: g.courseInterest,
        count: g._count.courseInterest,
      })),
    });
  } catch (err) {
    return handleError(err);
  }
}
