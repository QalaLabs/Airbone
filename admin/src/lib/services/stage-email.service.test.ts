import test from "node:test";
import assert from "node:assert/strict";
import { StageEmailService, type StageEmailDeps } from "./stage-email.service";

interface Sent {
  to: string;
  subject: string;
}

function harness(overrides: Partial<StageEmailDeps> = {}) {
  const sent: Sent[] = [];
  const activities: { idempotencyKey: string; stage: string }[] = [];
  const keys = new Set<string>();
  const deps: Partial<StageEmailDeps> = {
    findLead: async () => ({
      id: "lead-1",
      name: "Aman",
      email: "aman@example.com",
      phone: "9876543210",
      courseInterest: "CPL",
    }),
    hasSent: async (_leadId, key) => keys.has(key),
    isConfigured: () => true,
    send: async (message) => {
      sent.push({ to: message.to, subject: message.subject });
    },
    logActivity: async (input) => {
      keys.add(input.idempotencyKey);
      activities.push({ idempotencyKey: input.idempotencyKey, stage: input.stage });
    },
    ...overrides,
  };
  return { deps, sent, activities };
}

const base = { orgId: "org-1", stage: "ENROLLED", leadId: "lead-1", admissionId: "adm-1" };

test("SMS-01: sends one stage email and logs one activity", async () => {
  const { deps, sent, activities } = harness();
  assert.equal(await StageEmailService.triggerStageEmail(base, deps), true);
  assert.equal(sent.length, 1);
  assert.equal(sent[0]?.to, "aman@example.com");
  assert.match(sent[0]?.subject ?? "", /Enrollment|Welcome/i);
  assert.equal(activities.length, 1);
  assert.equal(activities[0]?.stage, "ENROLLED");
});

test("SMS-01: a duplicate stage event does not send twice", async () => {
  const { deps, sent, activities } = harness();
  assert.equal(await StageEmailService.triggerStageEmail(base, deps), true);
  assert.equal(await StageEmailService.triggerStageEmail(base, deps), false);
  assert.equal(sent.length, 1);
  assert.equal(activities.length, 1);
});

test("SMS-01: different stages are independent", async () => {
  const { deps, sent } = harness();
  assert.equal(await StageEmailService.triggerStageEmail(base, deps), true);
  assert.equal(await StageEmailService.triggerStageEmail({ ...base, stage: "FEE_PAYMENT" }, deps), true);
  assert.equal(sent.length, 2);
});

test("SMS-01: a failed provider send logs no activity and can be retried", async () => {
  let fail = true;
  const { deps, sent, activities } = harness({
    send: async (message) => {
      if (fail) throw new Error("smtp down");
      sent.push({ to: message.to, subject: message.subject });
    },
  });
  assert.equal(await StageEmailService.triggerStageEmail(base, deps), false);
  assert.equal(activities.length, 0);
  fail = false;
  assert.equal(await StageEmailService.triggerStageEmail(base, deps), true);
  assert.equal(sent.length, 1);
  assert.equal(activities.length, 1);
});

test("SMS-01: unconfigured provider, missing email and unsupported stage are all no-ops", async () => {
  assert.equal(
    await StageEmailService.triggerStageEmail(base, harness({ isConfigured: () => false }).deps),
    false,
  );
  assert.equal(
    await StageEmailService.triggerStageEmail(
      base,
      harness({
        findLead: async () => ({
          id: "lead-1",
          name: "Aman",
          email: null,
          phone: "9876543210",
          courseInterest: "CPL",
        }),
      }).deps,
    ),
    false,
  );
  const unsupported = harness();
  assert.equal(await StageEmailService.triggerStageEmail({ ...base, stage: "SOMETHING_ELSE" }, unsupported.deps), false);
  assert.equal(unsupported.sent.length, 0);
});
