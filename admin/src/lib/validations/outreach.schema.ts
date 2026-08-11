import { z } from "zod";

export const outreachTemplateSchema = z.object({
  id: z.string().uuid().optional(),
  event: z.enum([
    "NEW_LEAD",
    "LEAD_ASSIGNED",
    "LEAD_STATUS_CHANGED",
    "ADMISSION_STAGE_CHANGED",
    "JOB_PUBLISHED",
    "TESTIMONIAL_SUBMITTED",
    "PAYMENT_RECEIVED",
    "PLACEMENT_ADDED",
    "ENQUIRY_RECEIVED",
    "USER_INVITED",
    "TASK_DUE",
    "WORKFLOW_TRIGGERED",
  ]),
  channel: z.enum(["EMAIL", "SMS", "WHATSAPP", "IN_APP"]),
  name: z.string().min(1).max(255),
  subject: z.string().max(500).nullable().optional(),
  body: z.string().min(1),
  variables: z.array(z.string()).default([]),
  isActive: z.boolean().optional(),
});

export const toggleTemplateSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(),
});
