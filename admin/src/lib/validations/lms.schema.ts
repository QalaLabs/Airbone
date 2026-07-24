import { z } from "zod";

export const createLmsCourseSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().optional(),
  marketingCourseId: z.string().uuid().optional().nullable(),
  isPublished: z.boolean().optional(),
});

export const updateLmsCourseSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
});

export const createLmsStageSchema = z.object({
  title: z.string().min(1).max(255),
  order: z.number().int().min(0).optional(),
});

export const createLmsModuleSchema = z.object({
  title: z.string().min(1).max(255),
  order: z.number().int().min(0).optional(),
  unlockRules: z.record(z.unknown()).optional(),
  passPercent: z.number().int().min(0).max(100).optional(),
  maxAttempts: z.number().int().min(1).optional(),
});

export const updateLmsModuleSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  passPercent: z.number().int().min(0).max(100).optional(),
  maxAttempts: z.number().int().min(1).optional(),
});

export const createLmsChapterSchema = z.object({
  title: z.string().min(1).max(255),
  order: z.number().int().min(0).optional(),
});

export const createLmsTopicSchema = z.object({
  title: z.string().min(1).max(255),
  order: z.number().int().min(0).optional(),
});

export const createLmsContentSchema = z.object({
  title: z.string().min(1).max(255),
  type: z.enum(["PDF", "VIDEO", "NOTES"]),
  url: z.string().min(1),
  duration: z.number().int().positive().optional().nullable(),
  order: z.number().int().min(0).optional(),
});

export const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string().uuid(), order: z.number().int().min(0) })),
});

export const enrollStudentSchema = z.object({
  studentId: z.string().uuid(),
  courseId: z.string().uuid(),
});

export const markProgressSchema = z.object({
  topicId: z.string().uuid(),
  completed: z.boolean(),
  percent: z.number().int().min(0).max(100).optional(),
});

export const submitAssessmentSchema = z.object({
  moduleId: z.string().uuid(),
  score: z.number().int().min(0).max(100),
  status: z.enum(["PASS", "FAIL", "PENDING"]),
});

// Real MCQ quiz submission
export const submitQuizSchema = z.object({
  moduleId: z.string().uuid(),
  answers: z.record(z.string()), // { questionId: optionId }
});

export const markAttendanceSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().min(1).max(255),
  heldAt: z.string().datetime().optional(),
  records: z.array(
    z.object({
      studentId: z.string().uuid(),
      status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
      notes: z.string().optional(),
    }),
  ).min(1),
});

// Question bank
export const createQuestionSchema = z.object({
  moduleId: z.string().uuid(),
  stem: z.string().min(1).max(5000),
  options: z.array(z.object({ id: z.string().min(1), text: z.string().min(1) })).min(2).max(6),
  correctOptionId: z.string().min(1),
  order: z.number().int().min(0).optional(),
  points: z.number().int().min(1).optional(),
});

export const updateQuestionSchema = createQuestionSchema.partial().omit({ moduleId: true });

// Bookmarks
export const toggleBookmarkSchema = z.object({
  topicId: z.string().uuid(),
});

// Announcements
export const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(255),
  body: z.string().min(1),
  courseId: z.string().uuid().optional().nullable(),
  publishedAt: z.string().datetime().optional().nullable(),
});

// Certificate issue
export const issueCertificateSchema = z.object({
  studentId: z.string().uuid(),
  courseId: z.string().uuid(),
  title: z.string().min(1).max(255),
  certificateNo: z.string().min(1).max(100),
  verificationCode: z.string().max(100).optional(),
  fileUrl: z.string().optional(),
});

export type CreateLmsCourseInput = z.infer<typeof createLmsCourseSchema>;
export type UpdateLmsCourseInput = z.infer<typeof updateLmsCourseSchema>;
export type EnrollStudentInput = z.infer<typeof enrollStudentSchema>;
export type MarkProgressInput = z.infer<typeof markProgressSchema>;
export type SubmitAssessmentInput = z.infer<typeof submitAssessmentSchema>;
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type ToggleBookmarkInput = z.infer<typeof toggleBookmarkSchema>;
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type IssueCertificateInput = z.infer<typeof issueCertificateSchema>;
