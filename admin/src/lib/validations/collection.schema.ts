import { z } from "zod";

// Collection remark — records a finance/counselor note against a student's
// installment and synchronizes it to the lead's unified timeline (LeadActivity).

export const collectionFiltersSchema = z.object({
  search: z.string().max(255).optional(),
});

export const createCollectionRemarkSchema = z.object({
  admissionId: z.string().uuid(),
  /** Stable installment reference within the admission (item key/index). */
  installmentKey: z.string().min(1).max(255).optional(),
  installmentName: z.string().max(255).optional(),
  remark: z.string().min(1).max(5000),
  outcome: z.string().max(255).optional(),
  nextAction: z.string().max(1000).optional(),
  /** Client-supplied idempotency key to prevent duplicate timeline events. */
  idempotencyKey: z.string().min(1).max(255).optional(),
});

export type CreateCollectionRemarkInput = z.infer<typeof createCollectionRemarkSchema>;
