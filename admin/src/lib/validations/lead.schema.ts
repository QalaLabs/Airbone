import { z } from "zod";
import { LeadSource, LeadStatus, ActivityType } from "@prisma/client";

export const createLeadSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(7).max(20),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  courseInterest: z.string().max(255).optional(),
  source: z.nativeEnum(LeadSource).default("DIRECT"),
  assignedTo: z.string().uuid().optional(),
  campusId: z.string().uuid().optional(),
  utmSource: z.string().max(255).optional(),
  utmMedium: z.string().max(255).optional(),
  utmCampaign: z.string().max(255).optional(),
  utmTerm: z.string().max(255).optional(),
  utmContent: z.string().max(255).optional(),
  referrerUrl: z.string().url().optional().or(z.literal("")),
  landingPage: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  customFields: z.record(z.unknown()).optional(),
  nextFollowUp: z.string().datetime().optional(),
});

export const updateLeadSchema = createLeadSchema.partial().extend({
  status: z.nativeEnum(LeadStatus).optional(),
  lostReason: z.string().max(1000).optional(),
});

export const updateLeadStatusSchema = z.object({
  status: z.nativeEnum(LeadStatus),
  lostReason: z.string().max(1000).optional(),
});

export const assignLeadSchema = z.object({
  counselorId: z.string().uuid(),
});

export const leadFiltersSchema = z.object({
  status: z.nativeEnum(LeadStatus).optional(),
  source: z.nativeEnum(LeadSource).optional(),
  assignedTo: z.string().uuid().optional(),
  campusId: z.string().uuid().optional(),
  courseInterest: z.string().optional(),
  search: z.string().max(255).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "updatedAt", "score", "name", "status"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

// Lead Activity schemas
export const createActivitySchema = z.object({
  activityType: z.nativeEnum(ActivityType),
  title: z.string().max(500).optional(),
  notes: z.string().max(5000).optional(),
  outcome: z.string().max(255).optional(),
  nextAction: z.string().max(1000).optional(),
  dueAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  durationMins: z.number().min(0).max(1440).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateFollowUpSchema = z.object({
  nextFollowUp: z.string().datetime().nullable(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type LeadFilters = z.infer<typeof leadFiltersSchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
