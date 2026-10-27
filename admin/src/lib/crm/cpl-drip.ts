/**
 * SMS-02 — CPL inactivity drip.
 *
 * The old cron sent WhatsApp/email first and only then pushed the tier tag, so
 * two overlapping cron runs could both deliver the same message. This module
 * claims the tier tag BEFORE sending, releases it when every provider fails,
 * and logs exactly one timeline entry per delivery.
 */

export type CplDripTier = "14d" | "7d" | "48h";

export interface CplDripLead {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  courseInterest: string | null;
  tags: string[];
  createdAt: Date;
  lastActivityAt: Date | null;
}

export interface CplDripSelection {
  tier: CplDripTier;
  tag: string;
  campaignTitle: string;
  messageBody: string;
  subject: string;
}

const DAY = 24 * 60 * 60 * 1000;

export function selectCplDrip(lead: CplDripLead, now: Date): CplDripSelection | null {
  const lastAction = lead.lastActivityAt ?? lead.createdAt;
  const tags = new Set(lead.tags ?? []);
  const elapsed = now.getTime() - lastAction.getTime();

  if (elapsed >= 14 * DAY && !tags.has("cpl-drip-14d")) {
    const campaignTitle = "DGCA Upcoming Batch Deadline Reminder";
    return {
      tier: "14d",
      tag: "cpl-drip-14d",
      campaignTitle,
      messageBody: `Hi ${lead.name || "Aviation Aspirant"}, DGCA CPL batch admissions are closing for the upcoming month at Airborne Aviation. Only limited seats remain in Capt. Navrang Singh's mentor-led cohort.`,
      subject: `${campaignTitle} | Airborne Aviation Academy`,
    };
  }
  if (elapsed >= 7 * DAY && !tags.has("cpl-drip-7d")) {
    const campaignTitle = "CPL Ground Training Fee & Scholarship Overview";
    return {
      tier: "7d",
      tag: "cpl-drip-7d",
      campaignTitle,
      messageBody: `Hi ${lead.name || "there"}, explore our transparent CPL ground training fees and education loan assistance via SBI/BoB. Clear your DGCA papers on the first attempt with Airborne Aviation.`,
      subject: `${campaignTitle} | Airborne Aviation Academy`,
    };
  }
  if (elapsed >= 2 * DAY && !tags.has("cpl-drip-48h")) {
    const campaignTitle = "CPL Training Roadmap & Founder Video";
    return {
      tier: "48h",
      tag: "cpl-drip-48h",
      campaignTitle,
      messageBody: `Hi ${lead.name || "there"}, have you reviewed our DGCA CPL Ground School curriculum? Watch Capt. Navrang Singh explain how to clear all 5 DGCA papers in 3 months.`,
      subject: `${campaignTitle} | Airborne Aviation Academy`,
    };
  }
  return null;
}

export interface CplDripDeps {
  whatsappConfigured: boolean;
  emailConfigured: boolean;
  sendWhatsApp: (lead: CplDripLead, selection: CplDripSelection) => Promise<unknown>;
  sendEmail: (lead: CplDripLead, selection: CplDripSelection) => Promise<unknown>;
  /** Atomically add the tier tag only when it is absent. False means another run won. */
  claimTag: (leadId: string, tag: string) => Promise<boolean>;
  /** Remove a claim after every provider failed, so a later run retries. */
  releaseTag: (leadId: string, tag: string) => Promise<unknown>;
  logActivity: (lead: CplDripLead, selection: CplDripSelection, channels: string[]) => Promise<unknown>;
}

export type CplDripOutcome = "skipped" | "sent" | "failed";

export async function processCplDripLead(
  lead: CplDripLead,
  now: Date,
  deps: CplDripDeps,
): Promise<CplDripOutcome> {
  const selection = selectCplDrip(lead, now);
  if (!selection) return "skipped";

  const canWhatsApp = Boolean(lead.phone && deps.whatsappConfigured);
  const canEmail = Boolean(lead.email && deps.emailConfigured);
  if (!canWhatsApp && !canEmail) return "failed";

  // Claim first: only one concurrent cron run may send this tier.
  if (!(await deps.claimTag(lead.id, selection.tag))) return "skipped";

  const channels: string[] = [];
  if (canWhatsApp) {
    try {
      await deps.sendWhatsApp(lead, selection);
      channels.push("whatsapp");
    } catch (err) {
      console.warn(`[CPL Cron] WhatsApp send failed for ${lead.id}:`, err);
    }
  }
  if (canEmail) {
    try {
      await deps.sendEmail(lead, selection);
      channels.push("email");
    } catch (err) {
      console.warn(`[CPL Cron] Email send failed for ${lead.id}:`, err);
    }
  }

  if (channels.length === 0) {
    // Nothing was delivered: release the claim so the next run can retry.
    await deps.releaseTag(lead.id, selection.tag);
    return "failed";
  }

  await deps.logActivity(lead, selection, channels);
  return "sent";
}
