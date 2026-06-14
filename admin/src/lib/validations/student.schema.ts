import { z } from "zod";
import { StudentStatus } from "@prisma/client";

export const createStudentSchema = z.object({
  // Identity
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  nationality: z.string().max(100).default("Indian"),

  // Address as JSON
  address: z
    .object({
      line1: z.string().max(255).optional(),
      line2: z.string().max(255).optional(),
      city: z.string().max(100).optional(),
      state: z.string().max(100).optional(),
      pincode: z.string().max(10).optional(),
      country: z.string().max(2).default("IN"),
    })
    .optional(),

  // Guardian
  guardianName: z.string().max(255).optional(),
  guardianPhone: z.string().max(20).optional(),
  guardianEmail: z.string().email().optional(),

  // Medical
  medicalFitness: z.boolean().default(false),

  // Academic background
  class10Board: z.string().max(100).optional(),
  class10Year: z.number().int().min(1990).max(2030).optional(),
  class10Percent: z.number().min(0).max(100).optional(),
  class12Board: z.string().max(100).optional(),
  class12Year: z.number().int().min(1990).max(2030).optional(),
  class12Percent: z.number().min(0).max(100).optional(),
  class12Stream: z.enum(["SCIENCE", "COMMERCE", "ARTS", "OTHER"]).optional(),

  // Assignment
  campusId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),

  customFields: z.record(z.unknown()).optional(),
});

export const updateStudentSchema = createStudentSchema
  .omit({ leadId: true })
  .partial()
  .extend({
    status: z.nativeEnum(StudentStatus).optional(),
    enrolledAt: z.string().datetime().optional(),
    graduatedAt: z.string().datetime().optional(),
    droppedAt: z.string().datetime().optional(),
  });

export const studentFiltersSchema = z.object({
  status: z.nativeEnum(StudentStatus).optional(),
  campusId: z.string().uuid().optional(),
  search: z.string().max(255).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "firstName", "lastName", "status", "enrolledAt"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type StudentFilters = z.infer<typeof studentFiltersSchema>;
