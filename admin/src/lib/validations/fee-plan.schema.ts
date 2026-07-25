import { z } from "zod";

export const feePlanItemSchema = z.object({
  name: z.string().min(1).max(255),
  amount: z.number().positive(),
  dueOffsetDays: z.number().int().min(0).default(0),
  sortOrder: z.number().int().min(0).default(0),
  metadata: z.record(z.unknown()).optional(),
});

export const createFeePlanSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  currency: z.string().length(3).default("INR"),
  isActive: z.boolean().default(true),
  items: z.array(feePlanItemSchema).min(1),
  metadata: z.record(z.unknown()).optional(),
});

export const updateFeePlanSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional().nullable(),
  currency: z.string().length(3).optional(),
  isActive: z.boolean().optional(),
  items: z.array(feePlanItemSchema).min(1).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const feePlanFiltersSchema = z.object({
  search: z.string().max(255).optional(),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export type CreateFeePlanInput = z.infer<typeof createFeePlanSchema>;
export type UpdateFeePlanInput = z.infer<typeof updateFeePlanSchema>;
export type FeePlanFilters = z.infer<typeof feePlanFiltersSchema>;
