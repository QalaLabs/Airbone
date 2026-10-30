/**
 * All Leads follow-up sorting integration tests against a disposable PostgreSQL
 * database. Gated by LEADS_SORT_INTEGRATION=1.
 *
 * Verifies the documented ascending follow-up order:
 *   1. overdue (oldest overdue first)
 *   2. today (earliest time first)
 *   3. upcoming (nearest first)
 *   4. no scheduled follow-up last
 * and that the order holds across server-side pagination.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { prisma } from "@/lib/db/client";
import { LeadRepository } from "@/lib/repositories/lead.repository";
import type { LeadFilters } from "@/lib/validations/lead.schema";

const ENABLED = process.env.LEADS_SORT_INTEGRATION === "1";

async function seed() {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const org = await prisma.organization.create({
    data: { name: `SORT-INT-${suffix}`, slug: `sort-int-${suffix}` },
  });

  let seq = 0;
  const mk = (name: string, nextFollowUp: Date | null) =>
    prisma.lead.create({
      data: {
        orgId: org.id,
        name,
        phone: `9${String(Date.now()).slice(-9)}${String(seq++).padStart(2, "0")}`,
        status: "NEW",
        nextFollowUp,
      },
      select: { id: true, name: true, nextFollowUp: true },
    });

  const now = Date.now();
  const H = 3600_000;
  const D = 24 * H;
  const overdueOld = await mk("overdue-old", new Date(now - 3 * D));
  const overdueNew = await mk("overdue-new", new Date(now - 1 * D));
  const todayEarly = await mk("today-early", new Date(now + 0.5 * H));
  const todayLate = await mk("today-late", new Date(now + 1 * H));
  const upcomingNear = await mk("upcoming-near", new Date(now + 2 * D));
  const upcomingFar = await mk("upcoming-far", new Date(now + 10 * D));
  const noFollowUp = await mk("no-follow-up", null);

  return { org, ids: { overdueOld, overdueNew, todayEarly, todayLate, upcomingNear, upcomingFar, noFollowUp } };
}

async function cleanup(orgId: string) {
  await prisma.organization.deleteMany({ where: { id: orgId } }).catch(() => {});
}

test("leads sort: ascending next-follow-up order across the whole dataset", { skip: !ENABLED }, async () => {
  const s = await seed();
  try {
    const filters = {
      page: 1,
      limit: 100,
      sortBy: "nextFollowUp",
      sortDir: "asc",
    } as LeadFilters;

    const { data } = await LeadRepository.findMany(s.org.id, filters);
    const names = data.map((l) => l.name);

    const expected = [
      "overdue-old",
      "overdue-new",
      "today-early",
      "today-late",
      "upcoming-near",
      "upcoming-far",
      "no-follow-up",
    ];
    assert.deepEqual(names, expected, "overdue → today → upcoming → no follow-up (last)");
  } finally {
    await cleanup(s.org.id);
  }
});

test("leads sort: order is stable across server-side pagination", { skip: !ENABLED }, async () => {
  const s = await seed();
  try {
    const page = (p: number) =>
      LeadRepository.findMany(s.org.id, {
        page: p,
        limit: 2,
        sortBy: "nextFollowUp",
        sortDir: "asc",
      } as LeadFilters);

    const pages = await Promise.all([page(1), page(2), page(3), page(4)]);
    const all = pages.flatMap((p) => p.data.map((l) => l.name));
    const ids = pages.flatMap((p) => p.data.map((l) => l.id));

    assert.equal(new Set(ids).size, ids.length, "no duplicate rows across pages");
    assert.deepEqual(all, [
      "overdue-old",
      "overdue-new",
      "today-early",
      "today-late",
      "upcoming-near",
      "upcoming-far",
      "no-follow-up",
    ]);
  } finally {
    await cleanup(s.org.id);
  }
});
