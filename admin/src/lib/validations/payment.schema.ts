import { z } from "zod";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

export const createPaymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3).default("INR"),
  method: z.nativeEnum(PaymentMethod),
  feeType: z.enum(["registration", "tuition", "exam", "hostel", "other"]).optional(),
  description: z.string().max(1000).optional(),
  referenceNo: z.string().max(255).optional(),
  paidAt: z.string().datetime().optional(),
  notes: z.string().max(2000).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updatePaymentSchema = z.object({
  status: z.nativeEnum(PaymentStatus).optional(),
  referenceNo: z.string().max(255).optional(),
  paidAt: z.string().datetime().optional().nullable(),
  notes: z.string().max(2000).optional(),
  gatewayTxnId: z.string().max(255).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const paymentFiltersSchema = z.object({
  status: z.nativeEnum(PaymentStatus).optional(),
  method: z.nativeEnum(PaymentMethod).optional(),
  admissionId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
  campusId: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "amount", "paidAt", "status"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type PaymentFilters = z.infer<typeof paymentFiltersSchema>;
