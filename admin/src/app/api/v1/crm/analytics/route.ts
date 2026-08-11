import { prisma } from "@/lib/db/client";
import { guard } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { ok, handleError } from "@/lib/utils/response";
import type { Prisma } from "@prisma/client";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const m = parseInt(key.split("-")[1] ?? "0", 10) - 1;
  return MONTHS[m] ?? key;
}

function pct(part: number, total: number): string {
  if (total <= 0) return "0";
  return ((part / total) * 100).toFixed(1);
}

export async function GET() {
  try {
    const ctx = await getRequestContext();
    guard(ctx.user, "read", "analytics");

    // Counselors only see analytics over their own leads (ABAC parity with leads list)
    const leadWhere: Prisma.LeadWhereInput = { orgId: ctx.orgId, deletedAt: null };
    if (ctx.user.role === "ADMISSIONS_COUNSELOR" && ctx.user.id) {
      leadWhere.assignedTo = ctx.user.id;
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [
      totalLeads,
      pipelineLeads,
      convertedLeads,
      lostLeads,
      leadStatusCounts,
      leadSourceCounts,
      leadsInRange,
      admissionsAgg,
      admissionCount,
      admissionInRange,
      revenueAgg,
      paymentInRange,
      activityTypeCounts,
      admissionsByCounselor,
      counselors,
      studentsCount,
      admissionLeadsCount,
    ] = await Promise.all([
      prisma.lead.count({ where: leadWhere }),
      prisma.lead.count({
        where: { ...leadWhere, status: { notIn: ["CONVERTED", "LOST"] } },
      }),
      prisma.lead.count({ where: { ...leadWhere, status: "CONVERTED" } }),
      prisma.lead.count({ where: { ...leadWhere, status: "LOST" } }),
      prisma.lead.groupBy({ by: ["status"], where: leadWhere, _count: { _all: true } }),
      prisma.lead.groupBy({ by: ["source"], where: leadWhere, _count: { _all: true } }),
      prisma.lead.findMany({
        where: { ...leadWhere, createdAt: { gte: sixMonthsAgo } },
        select: { id: true, createdAt: true },
      }),
      prisma.admission.aggregate({
        where: { orgId: ctx.orgId },
        _avg: { feeFinal: true },
        _count: { _all: true },
      }),
      prisma.admission.count({ where: { orgId: ctx.orgId } }),
      prisma.admission.findMany({
        where: { orgId: ctx.orgId, createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
      }),
      prisma.paymentTransaction.aggregate({
        where: { orgId: ctx.orgId, status: "COMPLETED" },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.paymentTransaction.findMany({
        where: { orgId: ctx.orgId, status: "COMPLETED", createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true, amount: true },
      }),
      prisma.leadActivity.groupBy({
        by: ["activityType"],
        where: { orgId: ctx.orgId },
        _count: { _all: true },
      }),
      prisma.admission.groupBy({
        by: ["counselorId"],
        where: { orgId: ctx.orgId },
        _count: { _all: true },
      }),
      prisma.user.findMany({
        where: { orgId: ctx.orgId, role: "ADMISSIONS_COUNSELOR", isActive: true, deletedAt: null },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.student.count({ where: { orgId: ctx.orgId, deletedAt: null } }),
      prisma.lead.count({ where: { ...leadWhere, admissions: { some: {} } } }),
    ]);

    const revenue = revenueAgg._sum.amount ? Number(revenueAgg._sum.amount) : 0;
    const admissionLeads = admissionLeadsCount;
    const conversionRate = pct(admissionLeads, totalLeads);

    // Monthly buckets (last 6 months)
    const monthly: { key: string; label: string; leads: number; admissions: number; revenue: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1);
      const key = monthKey(d);
      monthly.push({ key, label: monthLabel(key), leads: 0, admissions: 0, revenue: 0 });
    }
    const monthIndex = new Map(monthly.map((m) => [m.key, m]));
    for (const l of leadsInRange) {
      const bucket = monthIndex.get(monthKey(l.createdAt));
      if (bucket) bucket.leads += 1;
    }
    for (const a of admissionInRange) {
      const bucket = monthIndex.get(monthKey(a.createdAt));
      if (bucket) bucket.admissions += 1;
    }
    for (const p of paymentInRange) {
      const bucket = monthIndex.get(monthKey(p.createdAt));
      if (bucket) bucket.revenue += Number(p.amount);
    }

    // Leads with admission per source (derived conversion)
    const admissionLeadIds = new Set(
      (await prisma.admission.findMany({
        where: { orgId: ctx.orgId },
        select: { leadId: true },
      })).map((a) => a.leadId),
    );
    const leadsBySource = new Map<string, { leads: number; admissions: number }>();
    const leadSourceRows = await prisma.lead.findMany({
      where: leadWhere,
      select: { source: true, id: true },
    });
    for (const l of leadSourceRows) {
      const row = leadsBySource.get(l.source) ?? { leads: 0, admissions: 0 };
      row.leads += 1;
      if (admissionLeadIds.has(l.id)) row.admissions += 1;
      leadsBySource.set(l.source, row);
    }
    const bySource = Array.from(leadsBySource.entries()).map(([source, row]) => ({
      source,
      leads: row.leads,
      admissions: row.admissions,
      conversion: `${pct(row.admissions, row.leads)}%`,
    })).sort((a, b) => b.leads - a.leads);

    const byStatus = leadStatusCounts
      .map((s) => ({ status: s.status, count: s._count._all }))
      .sort((a, b) => b.count - a.count);

    // Per-counselor performance from real assignment + activity records
    const leadsByCounselor = await prisma.lead.groupBy({
      by: ["assignedTo"],
      where: { ...leadWhere, assignedTo: { not: null } },
      _count: { _all: true },
    });
    const activityPerCounselor = await prisma.leadActivity.groupBy({
      by: ["performedBy", "activityType"],
      where: { orgId: ctx.orgId },
      _count: { _all: true },
    });
    const activityByCounselor = new Map<string, Record<string, number>>();
    for (const row of activityPerCounselor) {
      if (!row.performedBy) continue;
      const cur = activityByCounselor.get(row.performedBy) ?? {};
      cur[row.activityType] = row._count._all;
      activityByCounselor.set(row.performedBy, cur);
    }
    const counselorLeads = new Map(leadsByCounselor.map((r) => [r.assignedTo!, r._count._all]));
    const counselorAdmissions = new Map(admissionsByCounselor.map((r) => [r.counselorId ?? "", r._count._all]));
    const byCounselor = counselors.map((c) => {
      const leads = counselorLeads.get(c.id) ?? 0;
      const admissions = counselorAdmissions.get(c.id) ?? 0;
      const acts = activityByCounselor.get(c.id) ?? {};
      return {
        counselorId: c.id,
        name: c.name,
        leads,
        admissions,
        conversion: `${pct(admissions, leads)}%`,
        calls: acts.CALL ?? 0,
        meetings: acts.MEETING ?? 0,
        emails: acts.EMAIL ?? 0,
      };
    }).sort((a, b) => b.leads - a.leads);

    const activityByType = Object.fromEntries(
      activityTypeCounts.map((c) => [c.activityType, c._count._all]),
    );

    return ok({
      totals: {
        leads: totalLeads,
        pipeline: pipelineLeads,
        converted: convertedLeads,
        lost: lostLeads,
        admissionLeads,
        conversionRate,
        admissions: admissionCount,
        avgAdmissionFee: admissionsAgg._avg.feeFinal
          ? Number(admissionsAgg._avg.feeFinal.toFixed(0))
          : null,
        revenue,
        payments: revenueAgg._count._all,
        students: studentsCount,
        counselors: counselors.length,
        activities: activityTypeCounts.reduce((s, c) => s + c._count._all, 0),
        meetings: activityByType.MEETING ?? 0,
        calls: activityByType.CALL ?? 0,
      },
      monthly,
      bySource,
      byStatus,
      byCounselor,
    });
  } catch (err) {
    return handleError(err);
  }
}
