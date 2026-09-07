import { prisma } from "@/lib/db/client";
import { guard } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { ok, handleError } from "@/lib/utils/response";
import { buildAnalyticsScope } from "@/lib/analytics/scope";
import {
  ACTIVE_LEAD_STATUSES,
  TODAY_FOLLOW_UP_STATUSES,
  LOST_STATUSES,
} from "@/lib/leads/lead-status";

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

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export async function GET() {
  try {
    const ctx = await getRequestContext();
    guard(ctx.user, "read", "analytics");

    const {
      isCounselor,
      leadWhere,
      admissionWhere,
      paymentWhere,
      activityWhere,
      counselorWhere,
      studentWhere,
      dealWhere,
    } = buildAnalyticsScope(
      { id: ctx.user.id ?? "", role: ctx.user.role },
      ctx.orgId,
    );

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [
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
    ] = await Promise.all([
      prisma.lead.groupBy({ by: ["status"], where: leadWhere, _count: { _all: true } }),
      prisma.lead.groupBy({ by: ["source"], where: leadWhere, _count: { _all: true } }),
      prisma.lead.findMany({
        where: { ...leadWhere, createdAt: { gte: sixMonthsAgo } },
        select: { id: true, createdAt: true },
      }),
      prisma.admission.aggregate({
        where: admissionWhere,
        _avg: { feeFinal: true },
        _count: { _all: true },
      }),
      prisma.admission.count({ where: admissionWhere }),
      prisma.admission.findMany({
        where: { ...admissionWhere, createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
      }),
      prisma.paymentTransaction.aggregate({
        where: paymentWhere,
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.paymentTransaction.findMany({
        where: { ...paymentWhere, createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true, amount: true },
      }),
      prisma.leadActivity.groupBy({
        by: ["activityType"],
        where: activityWhere,
        _count: { _all: true },
      }),
      prisma.admission.groupBy({
        by: ["counselorId"],
        where: admissionWhere,
        _count: { _all: true },
      }),
      prisma.user.findMany({
        where: counselorWhere,
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.student.count({
        where: studentWhere,
      }),
    ]);

    let totalLeads = 0;
    let pipelineLeads = 0;
    let convertedLeads = 0;
    let lostLeads = 0;
    for (const c of leadStatusCounts) {
      totalLeads += c._count._all;
      if (c.status === "CONVERTED" || c.status === "WON") convertedLeads += c._count._all;
      else if (LOST_STATUSES.includes(c.status as any) || c.status === "LOST") lostLeads += c._count._all;
      else pipelineLeads += c._count._all;
    }

    const revenue = revenueAgg._sum.amount ? Number(revenueAgg._sum.amount) : 0;

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

    // Single scan of the org's admissions — used for source conversion, the
    // fee ledger, opportunity collections, and per-counselor collections. One
    // query instead of three separate table scans.
    const admissionLedger = await prisma.admission.findMany({
      where: admissionWhere,
      select: {
        id: true,
        leadId: true,
        feeFinal: true,
        feeAmount: true,
        feePaid: true,
        feeBalance: true,
        counselorId: true,
        lead: { select: { status: true, source: true } },
      },
    });
    const admissionLeadIds = new Set(admissionLedger.map((a) => a.leadId).filter(Boolean));

    const admissionLeads = admissionLeadIds.size;
    const conversionRate = pct(admissionLeads, totalLeads);

    const leadsBySource = new Map<string, { leads: number; admissions: number }>();
    for (const c of leadSourceCounts) {
      leadsBySource.set(c.source, { leads: c._count._all, admissions: 0 });
    }
    
    // Add admissions count by source using the admissionLedger
    for (const a of admissionLedger) {
      if (a.lead?.source) {
        const row = leadsBySource.get(a.lead.source) ?? { leads: 0, admissions: 0 };
        row.admissions += 1;
        leadsBySource.set(a.lead.source, row);
      }
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
      where: activityWhere,
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

    // ── Phase 2 overview metrics ────────────────────────────────────────────
    const todayStart = startOfDay(new Date());
    const activeLeadsCount = await prisma.lead.count({
      where: { ...leadWhere, status: { in: ACTIVE_LEAD_STATUSES } },
    });
    const newLeadsToday = await prisma.lead.count({
      where: { ...leadWhere, createdAt: { gte: todayStart } },
    });
    const todayFollowUps = await prisma.lead.count({
      where: { ...leadWhere, status: { in: TODAY_FOLLOW_UP_STATUSES } },
    });

    // ── Section 3 — opportunity metrics from the real Deal entity ───────────
    // opportunitySales = Deals WON today (deal.wonAt >= todayStart). Previously
    // this counted status=WON + convertedAt which is never set together and was
    // always 0. Counselors see their own deals; admins see the org.
    const dealScope = dealWhere;

    const [dealWonToday, dealStageRows, dealLinkedAdmissionIds] = await Promise.all([
      prisma.deal.count({
        where: { ...dealScope, wonAt: { gte: todayStart } },
      }),
      prisma.deal.findMany({
        where: dealScope,
        select: { stage: true, isActive: true, wonAt: true, lostAt: true },
      }),
      prisma.deal.findMany({
        where: { ...dealScope, admissionId: { not: null } },
        select: { admissionId: true },
      }),
    ]);
    const opportunitySales = dealWonToday;

    const dealPipelineCounts = {
      open: 0,
      won: 0,
      lost: 0,
      byStage: {} as Record<string, number>,
    };
    for (const d of dealStageRows) {
      dealPipelineCounts.byStage[d.stage] = (dealPipelineCounts.byStage[d.stage] ?? 0) + 1;
      if (d.lostAt) dealPipelineCounts.lost += 1;
      else if (d.wonAt) dealPipelineCounts.won += 1;
      else if (d.isActive) dealPipelineCounts.open += 1;
    }

    const dealAdmissionIdSet = new Set(
      dealLinkedAdmissionIds
        .map((d) => d.admissionId)
        .filter((x): x is string => Boolean(x)),
    );

    // Opportunity collections: COMPLETED payments today on admissions that are
    // linked to a Deal (deal.admissionId) — the deal-linked collection stream.
    const paymentsCompleted = await prisma.paymentTransaction.findMany({
      where: paymentWhere,
      select: { amount: true, createdAt: true, admissionId: true },
    });
    const opportunityCollectionsRaw = paymentsCompleted
      .filter(
        (p) =>
          p.createdAt >= todayStart &&
          p.admissionId &&
          dealAdmissionIdSet.has(p.admissionId),
      )
      .reduce((s, p) => s + Number(p.amount), 0);
    const totalCollections = revenue;
    const collectionsToday = paymentsCompleted
      .filter((p) => p.createdAt >= todayStart)
      .reduce((s, p) => s + Number(p.amount), 0);

    // Collection pending & collection % from admission fee ledger
    // (admissionLedger is fetched once above; reused here and for counselors).
    const validAdmissions = admissionLedger.filter(
      (a) => a.feeFinal != null && Number(a.feeFinal) > 0,
    );
    const totalfeeFinal = validAdmissions.reduce((s, a) => s + Number(a.feeFinal), 0);
    const totalPaid = admissionLedger.reduce((s, a) => s + Number(a.feePaid), 0);
    const totalCollectionPending = admissionLedger.reduce(
      (s, a) => s + Number(a.feeBalance),
      0,
    );
    const collectionPct = pct(totalPaid, totalfeeFinal);

    // Workable leads % per channel = ((source leads - source lost) / source leads) * 100
    const lostLeadSourceCounts = await prisma.lead.groupBy({
      by: ["source"],
      where: { ...leadWhere, status: { in: LOST_STATUSES } },
      _count: { _all: true },
    });
    const lostBySource = new Map<string, number>();
    for (const l of lostLeadSourceCounts) {
      lostBySource.set(l.source, l._count._all);
    }
    const workableTotal = totalLeads - lostLeads;
    const channelRows = bySource.map((c) => {
      const lost = lostBySource.get(c.source) ?? 0;
      return {
        ...c,
        lost,
        workableLeads: c.leads - lost,
        workablePct: `${pct(c.leads - lost, c.leads)}%`,
      };
    });
    const overallWorkablePct = `${pct(workableTotal, totalLeads)}%`;

    // Counsellor collection performance.
    const admissionByCounselorLedger = new Map<string, number>();
    const paidByCounselor = new Map<string, number>();
    for (const a of admissionLedger) {
      const cid = a.counselorId ?? "unassigned";
      if (a.feeFinal != null) {
        admissionByCounselorLedger.set(cid, (admissionByCounselorLedger.get(cid) ?? 0) + Number(a.feeFinal));
      }
      paidByCounselor.set(cid, (paidByCounselor.get(cid) ?? 0) + Number(a.feePaid));
    }

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

        // Phase 2 overview metrics
        activeLeads: activeLeadsCount,
        newLeadsToday,
        todayFollowUps,
        opportunitySales,
        opportunityCollections: Number(opportunityCollectionsRaw.toFixed(2)),
        collectionsToday: Number(collectionsToday.toFixed(2)),
        totalCollections: Number(totalCollections.toFixed(2)),
        totalCollectionPending: Number(totalCollectionPending.toFixed(2)),
        collectionPct,
        workableLeads: workableTotal,
        workablePct: overallWorkablePct,

        // Section 3 — deal pipeline from real Deal records
        dealsOpen: dealPipelineCounts.open,
        dealsWon: dealPipelineCounts.won,
        dealsLost: dealPipelineCounts.lost,
        dealPipelineByStage: dealPipelineCounts.byStage,
      },
      monthly,
      bySource: channelRows,
      byStatus,
      byCounselor: byCounselor.map((c) => ({
        ...c,
        collections: Number((paidByCounselor.get(c.counselorId) ?? 0).toFixed(2)),
        collectionPct: pct(paidByCounselor.get(c.counselorId) ?? 0, admissionByCounselorLedger.get(c.counselorId) ?? 0),
      })),
    });
  } catch (err) {
    return handleError(err);
  }
}
