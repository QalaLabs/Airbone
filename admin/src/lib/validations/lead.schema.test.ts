import test from "node:test";
import assert from "node:assert/strict";
import { LeadStatus } from "@prisma/client";
import { updateMeetingSchema, recordDispositionSchema } from "./lead.schema";
import { CALL_DISPOSITIONS } from "@/lib/leads/dispositions";

// ---------------------------------------------------------------- CRM-13 ----
test("CRM-13: completing a meeting without mode/duration/outcome is rejected", () => {
  const r = updateMeetingSchema.safeParse({ complete: true });
  assert.equal(r.success, false);
  if (r.success) return;
  const paths = r.error.issues.map((i) => i.path.join("."));
  assert.ok(paths.includes("mode"), "mode must be reported missing");
  assert.ok(paths.includes("durationMins"), "durationMins must be reported missing");
  assert.ok(paths.includes("outcome"), "outcome must be reported missing");
});

test("CRM-13: completing a meeting requires a duration greater than zero", () => {
  const r = updateMeetingSchema.safeParse({
    complete: true,
    mode: "ONLINE",
    durationMins: 0,
    outcome: "Interested",
  });
  assert.equal(r.success, false);
  if (r.success) return;
  assert.ok(r.error.issues.some((i) => i.path.join(".") === "durationMins"));
});

test("CRM-13: a whitespace-only outcome cannot complete a meeting", () => {
  const r = updateMeetingSchema.safeParse({
    complete: true,
    mode: "OFFLINE",
    durationMins: 30,
    outcome: "   ",
  });
  assert.equal(r.success, false);
});

test("CRM-13: completing a meeting with mode + positive duration + outcome is accepted", () => {
  const r = updateMeetingSchema.safeParse({
    complete: true,
    mode: "CAMPUS_VISIT",
    durationMins: 45,
    outcome: "Requested fee structure",
    notes: "Parent attended",
  });
  assert.equal(r.success, true);
});

test("CRM-13: a plain reschedule does not require the completion fields", () => {
  const r = updateMeetingSchema.safeParse({ dueAt: new Date().toISOString() });
  assert.equal(r.success, true);
});

// ---------------------------------------------------------------- CRM-04 ----
test("CRM-04: every canonical call disposition is accepted", () => {
  for (const disposition of CALL_DISPOSITIONS) {
    const r = recordDispositionSchema.safeParse({ disposition });
    assert.equal(r.success, true, `${disposition} should be a valid disposition`);
  }
});

test("CRM-04: commercial pipeline stages are NOT valid call dispositions", () => {
  for (const stage of [
    LeadStatus.NEW,
    LeadStatus.PROSPECT,
    LeadStatus.INTERESTED,
    LeadStatus.WON,
    LeadStatus.CONVERTED,
    LeadStatus.LOST,
  ]) {
    const r = recordDispositionSchema.safeParse({ disposition: stage });
    assert.equal(r.success, false, `${stage} is a pipeline stage, not a disposition`);
  }
});

test("CRM-04: unknown disposition strings are rejected", () => {
  assert.equal(recordDispositionSchema.safeParse({ disposition: "RANG_TWICE" }).success, false);
  assert.equal(recordDispositionSchema.safeParse({ disposition: "" }).success, false);
});

test("CRM-04: disposition accepts optional remarks and follow-up", () => {
  const r = recordDispositionSchema.safeParse({
    disposition: "CALL_BACK_REQUESTED",
    remarks: "Asked for a call after 6pm",
    nextFollowUp: new Date().toISOString(),
  });
  assert.equal(r.success, true);
});
