import { z } from "zod";

export const publicLeadSchema = z.object({
  name: z.string().trim().min(2).max(200),
  email: z.string().trim().email().max(255).nullish(),
  phone: z
    .string()
    .trim()
    .min(7)
    .max(20)
    .regex(/^[+\d][\d\s\-()]*$/, "phone must contain digits, spaces, dashes or parentheses"),
  courseInterest: z.string().trim().max(255).nullish(),
  pincode: z
    .string()
    .trim()
    .max(10)
    .nullish(),
  persona: z.enum(["Student", "Parent"]).default("Student"),
  source: z.string().trim().max(50).optional(),
  utmSource: z.string().trim().max(255).nullish(),
  utmMedium: z.string().trim().max(255).nullish(),
  utmCampaign: z.string().trim().max(255).nullish(),
  utmTerm: z.string().trim().max(255).nullish(),
  utmContent: z.string().trim().max(255).nullish(),
  referrerUrl: z.string().trim().max(2000).nullish(),
  landingPage: z.string().trim().max(2000).nullish(),
  leadUuid: z.string().trim().min(1).max(64).nullish(),
  eligibility: z.record(z.string().max(40), z.unknown()).nullish(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  message: z.string().trim().max(1000).nullish(),
  customFields: z.record(z.any()).optional(),
});

export type PublicLeadInput = z.infer<typeof publicLeadSchema>;
