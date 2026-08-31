import { LeadStatus } from "@prisma/client";

/**
 * Phase 2 lead status workflow hierarchy.
 *
 * Level 1 (pipeline stage):
 *   NEW, CONNECTED, NOT_CONNECTED, LOST
 * Level 2 (Connected):
 *   CALL_BACK, INTERESTED, PROSPECT, WON
 * Level 2 (Not Connected):
 *   RINGING, NOT_REACHABLE, SWITCHED_OFF, VOICEMAIL
 * Level 2 (Lost reasons):
 *   INCOMING_BARD, OUT_OF_SERVICE, NOT_AWARE, NOT_CONTACTABLE,
 *   LOCATION_OUT_OF_SCOPE, LANGUAGE_BARRIER, PRICE_HIGH, JOINED_OTHERS,
 *   NOT_ELIGIBLE, INVALID_NUMBER, TEST_LEAD
 *
 * Legacy values (CONTACTED / FOLLOW_UP / COUNSELED / APPLICATION_SUBMITTED)
 * remain in the DB enum for backward compatibility with historical data and
 * automations; new leads use the Phased 2 hierarchy above.
 */

export interface LeadStatusLevel {
  key: string;
  label: string;
  statuses: LeadStatus[];
}

export const LEAD_STATUS_HIERARCHY: LeadStatusLevel[] = [
  {
    key: "L1_CONNECTED_GROUP",
    label: "Connected",
    statuses: [
      LeadStatus.NEW,
      LeadStatus.CONNECTED,
      LeadStatus.CALL_BACK,
      LeadStatus.INTERESTED,
      LeadStatus.PROSPECT,
      LeadStatus.WON,
    ],
  },
  {
    key: "L1_NOT_CONNECTED_GROUP",
    label: "Not Connected",
    statuses: [
      LeadStatus.NOT_CONNECTED,
      LeadStatus.RINGING,
      LeadStatus.NOT_REACHABLE,
      LeadStatus.SWITCHED_OFF,
      LeadStatus.VOICEMAIL,
    ],
  },
  {
    key: "L1_LOST_GROUP",
    label: "Lost",
    statuses: [
      LeadStatus.LOST,
      LeadStatus.INCOMING_BARD,
      LeadStatus.OUT_OF_SERVICE,
      LeadStatus.NOT_AWARE,
      LeadStatus.NOT_CONTACTABLE,
      LeadStatus.LOCATION_OUT_OF_SCOPE,
      LeadStatus.LANGUAGE_BARRIER,
      LeadStatus.PRICE_HIGH,
      LeadStatus.JOINED_OTHERS,
      LeadStatus.NOT_ELIGIBLE,
      LeadStatus.INVALID_NUMBER,
      LeadStatus.TEST_LEAD,
    ],
  },
];

/** Flat list of every selectable status in the workflow. */
export const ALL_LEAD_STATUSES: LeadStatus[] = LEAD_STATUS_HIERARCHY.flatMap(
  (level) => level.statuses,
);

/** Lost / terminal statuses (used to disqualify a lead from conversion). */
export const LOST_STATUSES: LeadStatus[] = [
  LeadStatus.LOST,
  LeadStatus.INCOMING_BARD,
  LeadStatus.OUT_OF_SERVICE,
  LeadStatus.NOT_AWARE,
  LeadStatus.NOT_CONTACTABLE,
  LeadStatus.LOCATION_OUT_OF_SCOPE,
  LeadStatus.LANGUAGE_BARRIER,
  LeadStatus.PRICE_HIGH,
  LeadStatus.JOINED_OTHERS,
  LeadStatus.NOT_ELIGIBLE,
  LeadStatus.INVALID_NUMBER,
  LeadStatus.TEST_LEAD,
];

/** Productive statuses for funnel metrics. */
export const CONNECTED_STATUSES: LeadStatus[] = [
  LeadStatus.CONNECTED,
  LeadStatus.CALL_BACK,
  LeadStatus.INTERESTED,
  LeadStatus.PROSPECT,
  LeadStatus.WON,
];

/** "Total Active Leads" = New + Call back + Prospect (per Phase 2 spec). */
export const ACTIVE_LEAD_STATUSES: LeadStatus[] = [
  LeadStatus.NEW,
  LeadStatus.CALL_BACK,
  LeadStatus.PROSPECT,
];

/** "Today's Follow-ups" statuses (per Phase 2 spec). */
export const TODAY_FOLLOW_UP_STATUSES: LeadStatus[] = [
  LeadStatus.CALL_BACK,
  LeadStatus.NOT_CONNECTED,
  LeadStatus.NOT_CONTACTABLE,
  LeadStatus.INTERESTED,
  LeadStatus.PROSPECT,
];

/** "Today's Opportunity Sales" originate from Prospect-stage leads. */
export const OPPORTUNITY_STATUS: LeadStatus = LeadStatus.PROSPECT;

export const WON_STATUS: LeadStatus = LeadStatus.WON;

export function isLostStatus(status: LeadStatus): boolean {
  return LOST_STATUSES.includes(status);
}

export function isActiveStatus(status: LeadStatus): boolean {
  return ACTIVE_LEAD_STATUSES.includes(status);
}

/** Human readable label for a status value (e.g. LOCATION_OUT_OF_SCOPE → Location Out Of Scope). */
export function statusLabel(status: string): string {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Tailwind badge classes per status (shared with status-badge). */
export const LEAD_STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  CONTACTED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  INTERESTED: "bg-green-500/20 text-green-400 border-green-500/30",
  NOT_INTERESTED: "bg-red-500/20 text-red-400 border-red-500/30",
  FOLLOW_UP: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  COUNSELED: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  APPLICATION_SUBMITTED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  CONVERTED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  LOST: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  CONNECTED: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  CALL_BACK: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  PROSPECT: "bg-lime-500/20 text-lime-400 border-lime-500/30",
  WON: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  NOT_CONNECTED: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  RINGING: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  NOT_REACHABLE: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  SWITCHED_OFF: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  VOICEMAIL: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  INCOMING_BARD: "bg-gray-500/10 text-gray-400 border-gray-500/30",
  OUT_OF_SERVICE: "bg-gray-500/10 text-gray-400 border-gray-500/30",
  NOT_AWARE: "bg-gray-500/10 text-gray-400 border-gray-500/30",
  NOT_CONTACTABLE: "bg-gray-500/10 text-gray-400 border-gray-500/30",
  LOCATION_OUT_OF_SCOPE: "bg-gray-500/10 text-gray-400 border-gray-500/30",
  LANGUAGE_BARRIER: "bg-gray-500/10 text-gray-400 border-gray-500/30",
  PRICE_HIGH: "bg-gray-500/10 text-gray-400 border-gray-500/30",
  JOINED_OTHERS: "bg-gray-500/10 text-gray-400 border-gray-500/30",
  NOT_ELIGIBLE: "bg-gray-500/10 text-gray-400 border-gray-500/30",
  INVALID_NUMBER: "bg-gray-500/10 text-gray-400 border-gray-500/30",
  TEST_LEAD: "bg-gray-500/10 text-gray-400 border-gray-500/30",
};