import test from "node:test";
import assert from "node:assert/strict";
import { LeadStatus, LeadSource } from "@prisma/client";
import {
  ACTIVE_LEAD_STATUSES,
  CONNECTED_STATUSES,
  LOST_STATUSES,
  TODAY_FOLLOW_UP_STATUSES,
  OPPORTUNITY_STATUS,
  WON_STATUS,
  isLostStatus,
  isActiveStatus,
  statusLabel,
} from "./lead-status";
import { createLeadSchema, leadFiltersSchema } from "../validations/lead.schema";

test("ACTIVE_LEAD_STATUSES equals NEW + CALL_BACK + PROSPECT (Phase 2 spec)", () => {
  assert.deepEqual(
    [...ACTIVE_LEAD_STATUSES].sort(),
    [LeadStatus.NEW, LeadStatus.CALL_BACK, LeadStatus.PROSPECT].sort(),
  );
});

test("LOST_STATUSES contains terminal statuses and excludes WON", () => {
  assert.ok(LOST_STATUSES.includes(LeadStatus.LOST));
  assert.ok(LOST_STATUSES.includes(LeadStatus.PRICE_HIGH));
  assert.ok(LOST_STATUSES.includes(LeadStatus.NOT_ELIGIBLE));
  assert.ok(LOST_STATUSES.includes(LeadStatus.TEST_LEAD));
  assert.ok(!LOST_STATUSES.includes(LeadStatus.WON));
  assert.ok(!LOST_STATUSES.includes(LeadStatus.PROSPECT));
});

test("CONNECTED_STATUSES are productive funnel statuses", () => {
  assert.ok(CONNECTED_STATUSES.includes(LeadStatus.CONNECTED));
  assert.ok(CONNECTED_STATUSES.includes(LeadStatus.CALL_BACK));
  assert.ok(CONNECTED_STATUSES.includes(LeadStatus.PROSPECT));
  assert.ok(CONNECTED_STATUSES.includes(LeadStatus.WON));
  assert.ok(!CONNECTED_STATUSES.includes(LeadStatus.NOT_REACHABLE));
});

test("TODAY_FOLLOW_UP_STATUSES per Phase 2 spec", () => {
  for (const s of [LeadStatus.CALL_BACK, LeadStatus.NOT_CONNECTED, LeadStatus.NOT_CONTACTABLE, LeadStatus.INTERESTED, LeadStatus.PROSPECT]) {
    assert.ok(TODAY_FOLLOW_UP_STATUSES.includes(s), `${s} should be a follow-up status`);
  }
});

test("OPPORTUNITY_STATUS is PROSPECT and WON_STATUS is WON", () => {
  assert.equal(OPPORTUNITY_STATUS, LeadStatus.PROSPECT);
  assert.equal(WON_STATUS, LeadStatus.WON);
});

test("isLostStatus / isActiveStatus helpers", () => {
  assert.equal(isLostStatus(LeadStatus.LOST), true);
  assert.equal(isLostStatus(LeadStatus.PROSPECT), false);
  assert.equal(isActiveStatus(LeadStatus.NEW), true);
  assert.equal(isActiveStatus(LeadStatus.CALL_BACK), true);
  assert.equal(isActiveStatus(LeadStatus.PROSPECT), true);
  assert.equal(isActiveStatus(LeadStatus.WON), false);
  assert.equal(isActiveStatus(LeadStatus.LOST), false);
});

test("statusLabel humanises enum values", () => {
  assert.equal(statusLabel("PRICE_HIGH"), "Price High");
  assert.equal(statusLabel("NOT_ELIGIBLE"), "Not Eligible");
});

test("createLeadSchema accepts pincode, googleId, manualAmount", () => {
  const parsed = createLeadSchema.parse({
    name: "Test User",
    phone: "9876543210",
    email: "test@example.com",
    pincode: "110001",
    googleId: "g-12345",
    manualAmount: 50000,
  });
  assert.equal(parsed.pincode, "110001");
  assert.equal(parsed.googleId, "g-12345");
  assert.equal(parsed.manualAmount, 50000);
});

test("createLeadSchema rejects negative manualAmount and long pincode", () => {
  assert.throws(() =>
    createLeadSchema.parse({ name: "Test", phone: "9876543210", manualAmount: -5 }),
  );
  assert.throws(() =>
    createLeadSchema.parse({ name: "Test", phone: "9876543210", pincode: "1234567890123" }),
  );
});

test("leadFiltersSchema accepts all new lead statuses", async () => {
  for (const s of [
    "PROSPECT",
    "CALL_BACK",
    "NOT_REACHABLE",
    "PRICE_HIGH",
    "NOT_ELIGIBLE",
    "TEST_LEAD",
  ]) {
    const r = await leadFiltersSchema.safeParseAsync({ status: s });
    assert.equal(r.success, true, `${s} should be a valid filter status`);
  }
});

test("leadFiltersSchema rejects an unknown status", async () => {
  const r = await leadFiltersSchema.safeParseAsync({ status: "IMAGINARY_STATUS" });
  assert.equal(r.success, false);
});
