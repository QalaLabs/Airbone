import test from "node:test";
import assert from "node:assert/strict";
import { processCplDripLead, selectCplDrip, type CplDripDeps, type CplDripLead } from "./cpl-drip";

const NOW = new Date("2026-10-27T12:00:00.000Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000);

function lead(overrides: Partial<CplDripLead> = {}): CplDripLead {
  return {
    id: "lead-1",
    name: "Aman",
    phone: "9876543210",
    email: "aman@example.com",
    courseInterest: "CPL",
    tags: [],
    createdAt: daysAgo(20),
    lastActivityAt: daysAgo(20),
    ...overrides,
  };
}

function harness(overrides: Partial<CplDripDeps> = {}) {
  const state = {
    tags: new Set<string>(),
    sends: [] as string[],
    activities: [] as { tier: string; channels: string[] }[],
    releases: [] as string[],
  };
  const deps: CplDripDeps = {
    whatsappConfigured: true,
    emailConfigured: true,
    sendWhatsApp: async () => {
      state.sends.push("whatsapp");
    },
    sendEmail: async () => {
      state.sends.push("email");
    },
    claimTag: async (_leadId, tag) => {
      if (state.tags.has(tag)) return false;
      state.tags.add(tag);
      return true;
    },
    releaseTag: async (_leadId, tag) => {
      state.tags.delete(tag);
      state.releases.push(tag);
    },
    logActivity: async (_lead, selection, channels) => {
      state.activities.push({ tier: selection.tier, channels });
    },
    ...overrides,
  };
  return { deps, state };
}

test("SMS-02: repeated cron execution sends a tier only once", async () => {
  const { deps, state } = harness();
  assert.equal(await processCplDripLead(lead(), NOW, deps), "sent");
  assert.equal(await processCplDripLead(lead(), NOW, deps), "skipped");
  assert.equal(state.sends.length, 2, "one WhatsApp + one email on the first run");
  assert.equal(state.activities.length, 1, "exactly one timeline entry");
});

test("SMS-02: a concurrent run that loses the tag claim never sends", async () => {
  const { deps, state } = harness();
  state.tags.add("cpl-drip-14d");
  assert.equal(await processCplDripLead(lead(), NOW, deps), "skipped");
  assert.equal(state.sends.length, 0);
  assert.equal(state.activities.length, 0);
});

test("SMS-02: failed provider sends release the claim and log nothing", async () => {
  const { deps, state } = harness({
    sendWhatsApp: async () => {
      throw new Error("interakt down");
    },
    sendEmail: async () => {
      throw new Error("smtp down");
    },
  });
  assert.equal(await processCplDripLead(lead(), NOW, deps), "failed");
  assert.deepEqual(state.releases, ["cpl-drip-14d"]);
  assert.equal(state.activities.length, 0);
  assert.equal(state.tags.size, 0, "claim released for the next run");
});

test("SMS-02: one successful channel is enough to log the activity", async () => {
  const { deps, state } = harness({
    sendWhatsApp: async () => {
      throw new Error("interakt down");
    },
  });
  assert.equal(await processCplDripLead(lead(), NOW, deps), "sent");
  assert.deepEqual(state.activities, [{ tier: "14d", channels: ["email"] }]);
});

test("SMS-02: no configured provider leaves the lead untouched for a retry", async () => {
  const { deps, state } = harness({ whatsappConfigured: false, emailConfigured: false });
  assert.equal(await processCplDripLead(lead(), NOW, deps), "failed");
  assert.equal(state.tags.size, 0);
  assert.equal(state.sends.length, 0);
});

test("SMS-02: selects the most overdue unclaimed tier", () => {
  assert.equal(selectCplDrip(lead({ lastActivityAt: daysAgo(14) }), NOW)?.tier, "14d");
  assert.equal(selectCplDrip(lead({ lastActivityAt: daysAgo(7) }), NOW)?.tier, "7d");
  assert.equal(selectCplDrip(lead({ lastActivityAt: daysAgo(2) }), NOW)?.tier, "48h");
  assert.equal(selectCplDrip(lead({ lastActivityAt: daysAgo(1) }), NOW), null);
  assert.equal(
    selectCplDrip(lead({ lastActivityAt: daysAgo(20), tags: ["cpl-drip-14d", "cpl-drip-7d"] }), NOW)?.tier,
    "48h",
  );
});
