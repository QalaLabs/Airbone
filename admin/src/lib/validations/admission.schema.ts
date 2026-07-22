import { z } from "zod";
import { AdmissionStage } from "@prisma/client";

export const createAdmissionSchema = z.object({
  leadId: z.string().uuid(),
  campusId: z.string().uuid().optional(),
  counselorId: z.string().uuid().optional(),
  courseName: z.string().max(255).optional(),
  batchName: z.string().max(255).optional(),
  batchStartDate: z.string().datetime().optional(),
  feeAmount: z.number().positive().optional(),
  feeDiscount: z.number().min(0).default(0),
  notes: z.string().max(5000).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateAdmissionSchema = z.object({
  campusId: z.string().uuid().optional(),
  counselorId: z.string().uuid().optional().nullable(),
  studentId: z.string().uuid().optional().nullable(),
  courseName: z.string().max(255).optional(),
  batchName: z.string().max(255).optional(),
  batchStartDate: z.string().datetime().optional().nullable(),
  feeAmount: z.number().positive().optional(),
  feeDiscount: z.number().min(0).optional(),
  notes: z.string().max(5000).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const changeStageSchema = z.object({
  toStage: z.nativeEnum(AdmissionStage),
  notes: z.string().max(2000).optional(),
  // When moving to ENROLLED, optionally create/link student
  createStudent: z.boolean().optional(),
  studentId: z.string().uuid().optional(),
});

export const admissionFiltersSchema = z.object({
  stage: z.nativeEnum(AdmissionStage).optional(),
  campusId: z.string().uuid().optional(),
  counselorId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  search: z.string().max(255).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(200).default(20),
  sortBy: z.enum(["createdAt", "stage", "applicationNo", "stageChangedAt"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

// Valid stage transitions — enforced in service
export const STAGE_TRANSITIONS: Record<AdmissionStage, AdmissionStage[]> = {
  ENQUIRY: ["DOCUMENT_COLLECTION", "CANCELLED"],
  DOCUMENT_COLLECTION: ["VERIFICATION", "ENQUIRY", "CANCELLED"],
  VERIFICATION: ["OFFER_LETTER", "DOCUMENT_COLLECTION", "CANCELLED"],
  OFFER_LETTER: ["FEE_PAYMENT", "VERIFICATION", "CANCELLED"],
  FEE_PAYMENT: ["ENROLLED", "OFFER_LETTER", "CANCELLED"],
  ENROLLED: ["DROPPED"],
  DROPPED: [],
  CANCELLED: [],
};

export type CreateAdmissionInput = z.infer<typeof createAdmissionSchema>;
export type UpdateAdmissionInput = z.infer<typeof updateAdmissionSchema>;
export type ChangeStageInput = z.infer<typeof changeStageSchema>;
export type AdmissionFilters = z.infer<typeof admissionFiltersSchema>;
