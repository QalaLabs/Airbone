export interface Lead {
  name: string;
  lead_name: string;
  company_name?: string;
  email_id?: string;
  mobile_no?: string;
  status: string;
  source: string;
  lead_owner?: string;
  creation?: string;
  ai_score?: number;
  bant?: {
    budget: boolean;
    authority: boolean;
    need: boolean;
    timeline: boolean;
  };
}

export interface Deal {
  name: string;
  brand?: string;
  customer?: string;
  deal_value?: number;
  deal_stage: string;
  lead_owner?: string;
  creation?: string;
  days_left?: number;
  ai_score?: number;
  source?: string;
  product?: string;
}

export interface OutreachSequence {
  name: string;
  campaign_name: string;
  status: string;
  steps: number;
  sent: number;
  opened: number;
  replied: number;
  booked: number;
  conversion: string;
}

export interface Meeting {
  name: string;
  subject?: string;
  title?: string;
  date?: string;
  time?: string;
  duration?: string;
  type?: string;
  meeting_type?: string;
  attendees?: string[] | string;
  platform?: string;
  prep?: boolean;
  status: string;
  outcome?: string;
  follow_up?: string;
  followUp?: string;
  sentiment?: string;
}

export interface RevenueMetric {
  month: string;
  revenue: number;
  deals: number;
  forecasted: number;
}

export interface ChannelPerformance {
  source: string;
  channel?: string;
  count: number;
  leads?: number;
  meetings: number;
  deals: number;
  revenue: number;
  conversion: string;
}

export interface RepPerformance {
  name: string;
  deals: number;
  value: number;
  quota: number;
  calls: number;
  meetings: number;
}
