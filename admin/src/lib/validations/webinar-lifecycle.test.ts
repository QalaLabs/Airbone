import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { publicLeadSchema } from './public-lead.schema';
import { leadFiltersSchema } from './lead.schema';
import { buildLeadWhere } from '../repositories/lead.repository';

describe("Webinar Validation & Lifecycle Schema", () => {
  it("validates webinar intake with message and tags", () => {
    const input = {
      name: "Ramesh Sharma",
      email: "ramesh@example.com",
      phone: "+919876543210",
      source: "webinar",
      courseInterest: "Commercial Pilot License (CPL)",
      tags: ["webinar", "parents_webinar"],
      message: "[Parents Webinar 2026-10-31] Role: parent; Question: What are the medical standards for airline pilots?",
      leadUuid: "test-uuid-12345",
    };

    const parsed = publicLeadSchema.safeParse(input);
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.name, "Ramesh Sharma");
      assert.equal(parsed.data.source, "webinar");
      assert.ok(parsed.data.tags?.includes("webinar"));
      assert.ok(parsed.data.message?.includes("Question:"));
    }
  });

  it("validates lead filters schema with webinarStatus and tag", () => {
    const filterInput = {
      page: "1",
      limit: "20",
      tag: "webinar",
      webinarStatus: "paid",
    };

    const parsed = leadFiltersSchema.safeParse(filterInput);
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.tag, "webinar");
      assert.equal(parsed.data.webinarStatus, "paid");
    }
  });

  it("buildLeadWhere creates correct prisma query for webinar status and tags", () => {
    const wherePaid = buildLeadWhere("org-123", {
      tag: "webinar",
      webinarStatus: "paid",
    });

    assert.equal(wherePaid.orgId, "org-123");
    assert.deepEqual(wherePaid.tags, { has: "webinar" });
    assert.deepEqual(wherePaid.customFields, { path: ["webinar", "paymentStatus"], equals: "PAID" });

    const whereUnpaid = buildLeadWhere("org-123", {
      tag: "webinar",
      webinarStatus: "unpaid",
    });
    assert.deepEqual(whereUnpaid.customFields, { path: ["webinar", "paymentStatus"], equals: "UNPAID" });

    const whereFailed = buildLeadWhere("org-123", {
      tag: "webinar",
      webinarStatus: "failed",
    });
    assert.deepEqual(whereFailed.customFields, { path: ["webinar", "paymentStatus"], equals: "FAILED" });
  });
});
