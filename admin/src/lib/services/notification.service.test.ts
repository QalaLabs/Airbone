import test from "node:test";
import assert from "node:assert/strict";
import {
  NotificationService,
  interpolate,
  resolveProviderTemplateName,
  type NotificationDeps,
  type NotificationTemplateRecord,
} from "./notification.service";

test("SMS-07: interpolate substitutes known variables and leaves unknown tokens intact", () => {
  const result = interpolate("Hello {{ name }}, welcome to {{ course }}! Batch starts {{ date }}.", {
    name: "Rohit",
    course: "CPL Ground School",
  });
  assert.equal(result, "Hello Rohit, welcome to CPL Ground School! Batch starts {{ date }}.");
});

test("SMS-07: interpolate handles whitespace inside curly braces", () => {
  const result = interpolate("Hi {{  name  }}, your id is {{ id }}", {
    name: "Pooja",
    id: "12345",
  });
  assert.equal(result, "Hi Pooja, your id is 12345");
});

test("SMS-07: resolveProviderTemplateName uses explicit template name if given", () => {
  const wa = resolveProviderTemplateName("WHATSAPP", "cpl_batch_update", "CPL Update Display");
  assert.equal(wa, "cpl_batch_update");

  const email = resolveProviderTemplateName("EMAIL", "cpl_offer_letter", "CPL Offer Display");
  assert.equal(email, "cpl_offer_letter");
});

test("SMS-07: resolveProviderTemplateName falls back to display name for EMAIL/SMS when explicit name is absent", () => {
  const email = resolveProviderTemplateName("EMAIL", undefined, "CPL Welcome");
  assert.equal(email, "CPL Welcome");

  const sms = resolveProviderTemplateName("SMS", undefined, "SMS OTP Alert");
  assert.equal(sms, "SMS OTP Alert");
});

test("SMS-07: WhatsApp channel returns NOT_CONFIGURED when feature flag is disabled or absent", async () => {
  const deps: NotificationDeps = {
    getOrgFlags: async () => ({ whatsappNotifications: false }),
  };
  const status = await NotificationService.dispatch(
    {
      orgId: "org-1",
      event: "NEW_LEAD" as any,
      channel: "WHATSAPP",
      recipient: "9876543210",
    },
    deps,
  );
  assert.equal(status, "NOT_CONFIGURED");
});

test("SMS-07: returns null (fails closed) when no matching active template exists", async () => {
  const deps: NotificationDeps = {
    getOrgFlags: async () => ({ whatsappNotifications: true }),
    findTemplate: async () => null,
  };
  const status = await NotificationService.dispatch(
    {
      orgId: "org-1",
      event: "NEW_LEAD" as any,
      channel: "WHATSAPP",
      recipient: "9876543210",
    },
    deps,
  );
  assert.equal(status, null);
});

test("SMS-07: successfully dispatches through provider and returns delivery status", async () => {
  let dispatchedPayload: any = null;
  const loggedEntries: any[] = [];
  const mockTemplate: NotificationTemplateRecord = {
    id: "tmpl-1",
    name: "Lead Brochure Welcome",
    subject: "Welcome to Airborne {{ name }}",
    body: "Hi {{ name }}, thanks for your interest in {{ course }}.",
  };

  const deps: NotificationDeps = {
    findTemplate: async () => mockTemplate,
    createLog: async (data) => {
      loggedEntries.push(data);
      return { id: "log-1" };
    },
    updateLog: async (_id, data) => {
      loggedEntries.push(data);
    },
    dispatchToProvider: async (input) => {
      dispatchedPayload = input;
      return { status: "SENT", externalId: "msg_ext_123" };
    },
  };

  const status = await NotificationService.dispatch(
    {
      orgId: "org-1",
      event: "NEW_LEAD" as any,
      channel: "EMAIL",
      recipient: "student@example.com",
      variables: { name: "Ananya", course: "Cabin Crew" },
    },
    deps,
  );

  assert.equal(status, "SENT");
  assert.ok(dispatchedPayload);
  assert.equal(dispatchedPayload.recipient, "student@example.com");
  assert.equal(dispatchedPayload.subject, "Welcome to Airborne Ananya");
  assert.equal(dispatchedPayload.body, "Hi Ananya, thanks for your interest in Cabin Crew.");
  assert.ok(loggedEntries.length >= 1);
});

test("SMS-07: provider failure returns FAILED status without crashing or throwing", async () => {
  const mockTemplate: NotificationTemplateRecord = {
    id: "tmpl-2",
    name: "Admission Letter",
    subject: "Admission",
    body: "Your admission letter",
  };

  const deps: NotificationDeps = {
    findTemplate: async () => mockTemplate,
    createLog: async () => ({ id: "log-2" }),
    updateLog: async () => {},
    dispatchToProvider: async () => {
      return { status: "FAILED", errorMsg: "SMTP connection timeout" };
    },
  };

  const status = await NotificationService.dispatch(
    {
      orgId: "org-1",
      event: "ADMISSION_STAGE_CHANGED" as any,
      channel: "EMAIL",
      recipient: "student@example.com",
    },
    deps,
  );

  assert.equal(status, "FAILED");
});

test("SMS-07: fail-closed safety: provider exception is caught and returns null without throwing", async () => {
  const mockTemplate: NotificationTemplateRecord = {
    id: "tmpl-3",
    name: "Alert",
    subject: "Alert",
    body: "Alert message",
  };

  const deps: NotificationDeps = {
    findTemplate: async () => mockTemplate,
    createLog: async () => ({ id: "log-3" }),
    updateLog: async () => {},
    dispatchToProvider: async () => {
      throw new Error("Catastrophic network drop");
    },
  };

  const status = await NotificationService.dispatch(
    {
      orgId: "org-1",
      event: "NEW_LEAD" as any,
      channel: "EMAIL",
      recipient: "student@example.com",
    },
    deps,
  );

  assert.equal(status, null);
});
