import { prisma } from "@/lib/db/client";
import { guard } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { ok, handleError } from "@/lib/utils/response";

const TERMINAL_STAGES = ["ENROLLED", "DROPPED", "CANCELLED"] as const;export async function GET() {
  try {
    const ctx = await getRequestContext();
    guard(ctx.user, "read", "leads");

    const orgId = ctx.orgId;

    const [
      stageCounts,
      revenueAgg,
      pipelineAgg,
      pipelineCount,
      convertedLeads,
      recentAdmissions,
      convertedLeadsDetail,
    ] = await Promise.all([
      prisma.admission.groupBy({
        by: ["stage"],
        where: { orgId },
        _count: { _all: true },
      }),
      prisma.admission.aggregate({
        where: { orgId, stage: "ENROLLED" },
        _sum: { feeFinal: true },
      }),
      prisma.admission.aggregate({
        where: {
          orgId,
          stage: { notIn: [...TERMINAL_STAGES] },
          feeFinal: { not: null },
        },
        _sum: { feeFinal: true },
      }),
      prisma.admission.count({
        where: {
          orgId,
          stage: { notIn: [...TERMINAL_STAGES] },
          feeFinal: { not: null },
        },
      }),
      prisma.lead.count({
        where: { orgId, deletedAt: null, status: "CONVERTED" },
      }),
      prisma.admission.findMany({
        where: { orgId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          applicationNo: true,
          stage: true,
          feeFinal: true,
          createdAt: true,
          lead: { select: { id: true, name: true } },
          counselor: { select: { id: true, name: true } },
        },
      }),
      prisma.lead.findMany({
        where: { orgId, deletedAt: null, status: "CONVERTED" },
        select: { id: true, name: true, updatedAt: true },
        take: 10,
      }),
    ]);

    const byStage = Object.fromEntries(
      stageCounts.map((s) => [s.stage, s._count._all]),
    );
    const totalAdmissions = stageCounts.reduce((s, c) => s + c._count._all, 0);
    const wonValue = revenueAgg._sum?.feeFinal ? Number(revenueAgg._sum.feeFinal) : 0;
    const pipelineValue = pipelineAgg._sum?.feeFinal ? Number(pipelineAgg._sum.feeFinal) : 0;

    return ok({
      capability: {
        deals: false,
        status: "not_implemented",
        reason:
          "No dedicated Deal/Opportunity model exists in the schema. The native equivalent is the admission funnel (ENQUIRY → DOCUMENT_COLLECTION → VERIFICATION → OFFER_LETTER → FEE_PAYMENT → ENROLLED). Building a dedicated deals module requires a new Opportunity model and migration.",
      },
      derived: {
        funnelName: "Admission funnel (real persisted records)",
        byStage,
        totalAdmissions,
        won: byStage.ENROLLED ?? 0,
        wonValue,
        pipeline: pipelineCount,
        pipelineValue,
        convertedLeads,
        avgDaysToConvert: null,
      },
      recentAdmissions,
      recentConvertedLeads: convertedLeadsDetail,
    });
  } catch (err) {
    return handleError(err);
  }
}
