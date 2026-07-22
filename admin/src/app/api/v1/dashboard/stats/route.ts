import { prisma } from "@/lib/db/client";
import { guard } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { ok, handleError } from "@/lib/utils/response";

export async function GET() {
  try {
    const ctx = await getRequestContext();
    guard(ctx.user, "read", "analytics");

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      leadsCount,
      leadsToday,
      leadsThisWeek,
      leadsThisMonth,
      leadsFollowUp,
      studentsCount,
      admissionsCount,
      placementsCount,
      activeCounsellors,
      revenueResult
    ] = await Promise.all([
      prisma.lead.count({ where: { orgId: ctx.orgId, deletedAt: null } }),
      prisma.lead.count({ where: { orgId: ctx.orgId, createdAt: { gte: todayStart }, deletedAt: null } }),
      prisma.lead.count({ where: { orgId: ctx.orgId, createdAt: { gte: weekStart }, deletedAt: null } }),
      prisma.lead.count({ where: { orgId: ctx.orgId, createdAt: { gte: monthStart }, deletedAt: null } }),
      prisma.lead.count({ where: { orgId: ctx.orgId, status: "FOLLOW_UP", deletedAt: null } }),
      prisma.student.count({ where: { orgId: ctx.orgId, deletedAt: null } }),
      prisma.admission.count({ where: { orgId: ctx.orgId } }),
      prisma.placement.count({ where: { orgId: ctx.orgId } }),
      prisma.user.count({ where: { orgId: ctx.orgId, role: "ADMISSIONS_COUNSELOR", isActive: true, deletedAt: null } }),
      prisma.paymentTransaction.aggregate({
        _sum: { amount: true },
        where: { orgId: ctx.orgId, status: "COMPLETED" }
      })
    ]);

    const revenue = revenueResult._sum.amount ? Number(revenueResult._sum.amount) : 0;

    return ok({
      leadsCount,
      leadsToday,
      leadsThisWeek,
      leadsThisMonth,
      leadsFollowUp,
      studentsCount,
      admissionsCount,
      placementsCount,
      activeCounsellors,
      revenue,
    });
  } catch (err) {
    return handleError(err);
  }
}
