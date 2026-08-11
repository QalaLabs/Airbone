// Real persisted CRM types served by /api/v1/crm/*

export interface AnalyticsTotals {
  leads: number;
  pipeline: number;
  converted: number;
  lost: number;
  admissionLeads: number;
  conversionRate: string;
  admissions: number;
  avgAdmissionFee: number | null;
  revenue: number;
  payments: number;
  students: number;
  counselors: number;
  activities: number;
  meetings: number;
  calls: number;
}

export interface AnalyticsMonth {
  key: string;
  label: string;
  leads: number;
  admissions: number;
  revenue: number;
}

export interface AnalyticsSourceRow {
  source: string;
  leads: number;
  admissions: number;
  conversion: string;
}

export interface AnalyticsStatusRow {
  status: string;
  count: number;
}

export interface AnalyticsCounselorRow {
  counselorId: string;
  name: string;
  leads: number;
  admissions: number;
  conversion: string;
  calls: number;
  meetings: number;
  emails: number;
}

export interface AnalyticsData {
  totals: AnalyticsTotals;
  monthly: AnalyticsMonth[];
  bySource: AnalyticsSourceRow[];
  byStatus: AnalyticsStatusRow[];
  byCounselor: AnalyticsCounselorRow[];
}

export interface OutreachTemplate {
  id: string;
  event: string;
  channel: string;
  name: string;
  subject: string | null;
  body: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OutreachLog {
  id: string;
  event: string | null;
  channel: string;
  recipient: string;
  subject: string | null;
  status: string;
  errorMsg: string | null;
  externalId: string | null;
  entityType: string | null;
  entityId: string | null;
  sentAt: string | null;
  createdAt: string;
  template: { id: string; name: string } | null;
}

export interface OutreachProvider {
  configured: boolean;
  provider: string;
}

export interface OutreachData {
  templates: OutreachTemplate[];
  logs: OutreachLog[];
  statusBreakdown: Record<string, number>;
  delivery: { total: number; sent: number; failed: number; pending: number };
  providers: {
    email: OutreachProvider;
    sms: OutreachProvider;
    whatsapp: OutreachProvider;
  };
  dispatchEngine: { inngestEnabled: boolean; note: string };
}

export interface MeetingLead {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  courseInterest: string | null;
  status: string;
  campusId: string | null;
  assignedTo: string | null;
  counselor: { id: string; name: string } | null;
}

export interface Meeting {
  id: string;
  leadId: string;
  performedBy: string | null;
  title: string | null;
  notes: string | null;
  outcome: string | null;
  nextAction: string | null;
  dueAt: string | null;
  completedAt: string | null;
  durationMins: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  lead: MeetingLead;
  performer: { id: string; name: string; avatarUrl: string | null } | null;
}

export interface MeetingsData {
  scope: "upcoming" | "past" | "all";
  meetings: Meeting[];
}

export interface DealData {
  capability: {
    deals: boolean;
    status: string;
    reason: string;
  };
  derived: {
    funnelName: string;
    byStage: Record<string, number>;
    totalAdmissions: number;
    won: number;
    wonValue: number;
    pipeline: number;
    pipelineValue: number;
    convertedLeads: number;
    avgDaysToConvert: number | null;
  };
  recentAdmissions: {
    id: string;
    applicationNo: string;
    stage: string;
    feeFinal: number | null;
    createdAt: string;
    lead: { id: string; name: string } | null;
    counselor: { id: string; name: string } | null;
  }[];
  recentConvertedLeads: { id: string; name: string; updatedAt: string }[];
}

export interface IntegrationStatus {
  status: "connected" | "not_configured" | "removed";
  provider?: string;
  note?: string;
  required?: string[];
  assets?: number;
}

export interface IntegrationsData {
  crm: IntegrationStatus;
  facebook: IntegrationStatus;
  googleAds: IntegrationStatus;
  frappe: IntegrationStatus;
  media: IntegrationStatus;
  documents: IntegrationStatus;
  inngest: IntegrationStatus;
  payments: IntegrationStatus;
  summary: {
    connected: string[];
    notConfigured: string[];
  };
}
