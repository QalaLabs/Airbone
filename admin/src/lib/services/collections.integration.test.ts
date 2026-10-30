/**
 * Finance Collections integration tests against a disposable PostgreSQL
 * database. Gated by COLLECTIONS_INTEGRATION=1.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { prisma } from "@/lib/db/client";
import { CollectionsService } from "@/lib/services/collections.service";
import { TimelineService } from "@/lib/services/timeline.service";
import type { RequestContext } from "@/types";

const ENABLED = process.env.COLLECTIONS_INTEGRATION === "1";

const ctx = (orgId: string, userId: string): RequestContext => ({
  orgId,
  user: {
    id: userId,
    orgId,
    campusId: null,
    name: "Finance Admin",
    email: `finance-${userId}@example.com`,
    role: "ADMIN",
    avatarUrl: null,
  },
  requestId: `req-${orgId}`,
  ipAddress: "127.0.0.1",
  userAgent: "node:test",
});

async function seed() {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const org = await prisma.organization.create({
    data: { name: `COL-INT-${suffix}`, slug: `col-int-${suffix}` },
  });
  const user = await prisma.user.create({
    data: { orgId: org.id, name: "Finance Admin", email: `finance-${suffix}@example.com`, role: "ADMIN", passwordHash: null },
  });
  const lead = await prisma.lead.create({
    data: { orgId: org.id, name: `Collections Lead ${suffix}`, phone: `93${Date.now().toString().slice(-10)}`, status: "PROSPECT" },
  });
  const student = await prisma.student.create({
    data: {
      orgId: org.id,
      leadId: lead.id,
      studentCode: `STU-${suffix}`,
      firstName: "Collections",
      lastName: "Lead",
      email: `student-${suffix}@example.com`,
      phone: lead.phone,
      status: "ACTIVE",
    },
  });
  const feePlan = await prisma.feePlan.create({
    data: {
      orgId: org.id,
      name: `Collections Plan ${suffix}`,
      items: {
        create: [
          { name: "Past", amount: 30000, dueOffsetDays: -365, sortOrder: 0 },
          { name: "Current", amount: 40000, dueOffsetDays: 0, sortOrder: 1 },
          { name: "Future", amount: 30000, dueOffsetDays: 365, sortOrder: 2 },
        ],
      },
    },
    include: { items: true },
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const admission = await prisma.admission.create({
    data: {
      orgId: org.id,
      leadId: lead.id,
      studentId: student.id,
      applicationNo: `COL-${suffix}`,
      stage: "FEE_PAYMENT",
      courseName: "CPL",
      feePlanId: feePlan.id,
      feeAmount: 100000,
      feeFinal: 100000,
      feeBalance: 100000,
      batchStartDate: today,
      metadata: {},
    },
  });
  return { orgId: org.id, userId: user.id, leadId: lead.id, admissionId: admission.id };
}

async function cleanup(orgId: string) {
  await Promise.all([
    prisma.activityFeedItem.deleteMany({ where: { orgId } }),
    prisma.internalEvent.deleteMany({ where: { orgId } }),
    prisma.eventLog.deleteMany({ where: { orgId } }),
    prisma.auditLog.deleteMany({ where: { orgId } }),
  ]).catch(() => {});
  await prisma.organization.deleteMany({ where: { id: orgId } }).catch(() => {});
}

test("collections: overdue vs due-this-month classification and totals", { skip: !ENABLED }, async () => {
  const s = await seed();
  try {
    const c = ctx(s.orgId, s.userId);
    const res = await CollectionsService.getCollections(c);

    assert.equal(res.overdue.length, 1);
    assert.equal(res.overdue[0]!.installmentName, "Past");
    assert.equal(res.overdue[0]!.pending, 30000);
    assert.ok(res.overdue[0]!.daysOverdue >= 365);

    assert.equal(res.dueThisMonth.length, 1);
    assert.equal(res.dueThisMonth[0]!.installmentName, "Current");
    assert.equal(res.dueThisMonth[0]!.pending, 40000);

    assert.equal(res.totals.outstanding, 100000);
    assert.equal(res.totals.overdue, 30000);
    assert.equal(res.totals.dueThisMonth, 40000);
  } finally {
    await cleanup(s.orgId);
  }
});

test("collections: payments reduce outstanding FIFO and remarks sync to the timeline idempotently", { skip: !ENABLED }, async () => {
  const s = await seed();
  try {
    const c = ctx(s.orgId, s.userId);

    // 10,000 paid allocates to the earliest-due ("Past") installment first.
    await prisma.paymentTransaction.create({
      data: { orgId: s.orgId, admissionId: s.admissionId, amount: 10000, method: "BANK_TRANSFER", status: "COMPLETED", paidAt: new Date() },
    });

    const res = await CollectionsService.getCollections(c);
    const past = res.overdue.find((r) => r.installmentName === "Past");
    assert.equal(past?.paid, 10000);
    assert.equal(past?.pending, 20000);

    // Idempotent remark: same key replays the same timeline entry.
    const first = await CollectionsService.addRemark(c, {
      admissionId: s.admissionId,
      installmentKey: "0",
      installmentName: "Past",
      remark: "Spoke to guardian — promises payment Friday",
      outcome: "Promise to pay",
      nextAction: "Follow up Friday",
      idempotencyKey: "remark-key-1",
    });
    const second = await CollectionsService.addRemark(c, {
      admissionId: s.admissionId,
      installmentKey: "0",
      installmentName: "Past",
      remark: "Spoke to guardian — promises payment Friday",
      outcome: "Promise to pay",
      nextAction: "Follow up Friday",
      idempotencyKey: "remark-key-1",
    });
    assert.equal(second.id, first.id);
    assert.equal(second.replayed, true);

    const count = await prisma.leadActivity.count({
      where: { orgId: s.orgId, leadId: s.leadId, metadata: { path: ["kind"], equals: "collection_remark" } },
    });
    assert.equal(count, 1, "no duplicate timeline events on retries");

    // The remark appears in the unified (lead) timeline.
    const timeline = await TimelineService.getTimeline(s.orgId, { entityType: "LEAD", entityId: s.leadId, page: 1, limit: 20 });
    const entry = timeline.items.find((e) => e.kind === "activity" && e.detail === "Spoke to guardian — promises payment Friday");
    assert.ok(entry, "collection remark surfaces in the unified timeline");

    // And as the latest remark on the overdue row.
    const after = await CollectionsService.getCollections(c);
    const pastAfter = after.overdue.find((r) => r.installmentName === "Past");
    assert.equal(pastAfter?.latestRemark?.text, "Spoke to guardian — promises payment Friday");
    assert.equal(pastAfter?.latestRemark?.authorName, "Finance Admin");
  } finally {
    await cleanup(s.orgId);
  }
});
