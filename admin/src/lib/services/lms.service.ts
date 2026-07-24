import { prisma } from "@/lib/db/client";
import { NotFoundError, ConflictError, ForbiddenError } from "@/lib/utils/errors";
import type { RequestContext } from "@/types";
import type {
  CreateLmsCourseInput,
  UpdateLmsCourseInput,
  EnrollStudentInput,
  MarkProgressInput,
  SubmitAssessmentInput,
  SubmitQuizInput,
  MarkAttendanceInput,
  CreateQuestionInput,
  UpdateQuestionInput,
  ToggleBookmarkInput,
  CreateAnnouncementInput,
  IssueCertificateInput,
} from "@/lib/validations/lms.schema";

const courseTreeInclude = {
  stages: {
    orderBy: { order: "asc" as const },
    include: {
      modules: {
        orderBy: { order: "asc" as const },
        include: {
          chapters: {
            orderBy: { order: "asc" as const },
            include: {
              topics: {
                orderBy: { order: "asc" as const },
                include: {
                  contents: { orderBy: { order: "asc" as const } },
                },
              },
            },
          },
          assessments: true,
          _count: { select: { questions: true } },
        },
      },
    },
  },
  teachers: { include: { teacher: { select: { id: true, name: true, email: true } } } },
} as const;

export class LmsService {
  /** Resolve CRM Student row linked to the logged-in portal User. */
  static async resolveLinkedStudent(ctx: RequestContext) {
    const student = await prisma.student.findFirst({
      where: {
        orgId: ctx.orgId,
        userId: ctx.user.id,
        deletedAt: null,
        status: "ACTIVE",
      },
      select: {
        id: true,
        studentCode: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
      },
    });
    if (!student) throw new NotFoundError("Student", ctx.user.id);
    return student;
  }

  static async me(ctx: RequestContext) {
    const student = await this.resolveLinkedStudent(ctx);
    const dashboard = await this.studentDashboard(ctx, student.id);
    return { student, user: { id: ctx.user.id, name: ctx.user.name, email: ctx.user.email, role: ctx.user.role }, ...dashboard };
  }

  static async listCourses(ctx: RequestContext) {
    return prisma.lmsCourse.findMany({
      where: { orgId: ctx.orgId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { enrollments: true, stages: true } },
        teachers: { include: { teacher: { select: { id: true, name: true } } } },
      },
    });
  }

  static async getCourseTree(ctx: RequestContext, courseId: string) {
    const course = await prisma.lmsCourse.findFirst({
      where: { id: courseId, orgId: ctx.orgId },
      include: courseTreeInclude,
    });
    if (!course) throw new NotFoundError("LmsCourse", courseId);
    return course;
  }

  static async createCourse(ctx: RequestContext, input: CreateLmsCourseInput) {
    const existing = await prisma.lmsCourse.findFirst({
      where: { orgId: ctx.orgId, slug: input.slug },
      select: { id: true },
    });
    if (existing) throw new ConflictError(`LMS course slug "${input.slug}" already exists`);

    return prisma.lmsCourse.create({
      data: {
        orgId: ctx.orgId,
        title: input.title,
        slug: input.slug,
        description: input.description,
        marketingCourseId: input.marketingCourseId ?? null,
        isPublished: input.isPublished ?? false,
        status: input.isPublished ? "PUBLISHED" : "DRAFT",
      },
    });
  }

  static async updateCourse(ctx: RequestContext, courseId: string, input: UpdateLmsCourseInput) {
    const course = await prisma.lmsCourse.findFirst({ where: { id: courseId, orgId: ctx.orgId } });
    if (!course) throw new NotFoundError("LmsCourse", courseId);
    return prisma.lmsCourse.update({
      where: { id: courseId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.isPublished !== undefined ? { isPublished: input.isPublished, status: input.isPublished ? "PUBLISHED" : "DRAFT" } : {}),
      },
    });
  }

  // ─── Stage CRUD ───────────────────────────────────────────────────────────

  static async createStage(ctx: RequestContext, courseId: string, title: string, order?: number) {
    const course = await prisma.lmsCourse.findFirst({ where: { id: courseId, orgId: ctx.orgId } });
    if (!course) throw new NotFoundError("LmsCourse", courseId);

    const nextOrder = order ?? (await prisma.lmsStage.count({ where: { courseId } }));
    return prisma.lmsStage.create({ data: { courseId, title, order: nextOrder } });
  }

  static async updateStage(ctx: RequestContext, stageId: string, data: { title?: string; order?: number }) {
    const stage = await prisma.lmsStage.findFirst({
      where: { id: stageId },
      include: { course: { select: { orgId: true } } },
    });
    if (!stage || stage.course.orgId !== ctx.orgId) throw new NotFoundError("LmsStage", stageId);
    return prisma.lmsStage.update({ where: { id: stageId }, data });
  }

  static async deleteStage(ctx: RequestContext, stageId: string) {
    const stage = await prisma.lmsStage.findFirst({
      where: { id: stageId },
      include: { course: { select: { orgId: true } } },
    });
    if (!stage || stage.course.orgId !== ctx.orgId) throw new NotFoundError("LmsStage", stageId);
    await prisma.lmsStage.delete({ where: { id: stageId } });
  }

  static async reorderStages(ctx: RequestContext, courseId: string, items: { id: string; order: number }[]) {
    const course = await prisma.lmsCourse.findFirst({ where: { id: courseId, orgId: ctx.orgId } });
    if (!course) throw new NotFoundError("LmsCourse", courseId);
    await prisma.$transaction(items.map((i) => prisma.lmsStage.update({ where: { id: i.id }, data: { order: i.order } })));
  }

  // ─── Module CRUD ──────────────────────────────────────────────────────────

  static async createModule(ctx: RequestContext, stageId: string, data: { title: string; order?: number; passPercent?: number; maxAttempts?: number }) {
    const stage = await prisma.lmsStage.findFirst({
      where: { id: stageId },
      include: { course: { select: { orgId: true } } },
    });
    if (!stage || stage.course.orgId !== ctx.orgId) throw new NotFoundError("LmsStage", stageId);
    const nextOrder = data.order ?? (await prisma.lmsModule.count({ where: { stageId } }));
    return prisma.lmsModule.create({
      data: {
        stageId,
        title: data.title,
        order: nextOrder,
        passPercent: data.passPercent ?? 70,
        maxAttempts: data.maxAttempts ?? 3,
      },
    });
  }

  static async updateModule(ctx: RequestContext, moduleId: string, data: { title?: string; passPercent?: number; maxAttempts?: number; order?: number }) {
    const mod = await prisma.lmsModule.findFirst({
      where: { id: moduleId },
      include: { stage: { include: { course: { select: { orgId: true } } } } },
    });
    if (!mod || mod.stage.course.orgId !== ctx.orgId) throw new NotFoundError("LmsModule", moduleId);
    return prisma.lmsModule.update({ where: { id: moduleId }, data });
  }

  static async deleteModule(ctx: RequestContext, moduleId: string) {
    const mod = await prisma.lmsModule.findFirst({
      where: { id: moduleId },
      include: { stage: { include: { course: { select: { orgId: true } } } } },
    });
    if (!mod || mod.stage.course.orgId !== ctx.orgId) throw new NotFoundError("LmsModule", moduleId);
    await prisma.lmsModule.delete({ where: { id: moduleId } });
  }

  // ─── Chapter CRUD ─────────────────────────────────────────────────────────

  static async createChapter(ctx: RequestContext, moduleId: string, title: string, order?: number) {
    const mod = await prisma.lmsModule.findFirst({
      where: { id: moduleId },
      include: { stage: { include: { course: { select: { orgId: true } } } } },
    });
    if (!mod || mod.stage.course.orgId !== ctx.orgId) throw new NotFoundError("LmsModule", moduleId);
    const nextOrder = order ?? (await prisma.lmsChapter.count({ where: { moduleId } }));
    return prisma.lmsChapter.create({ data: { moduleId, title, order: nextOrder } });
  }

  static async updateChapter(ctx: RequestContext, chapterId: string, data: { title?: string; order?: number }) {
    const ch = await prisma.lmsChapter.findFirst({
      where: { id: chapterId },
      include: { module: { include: { stage: { include: { course: { select: { orgId: true } } } } } } },
    });
    if (!ch || ch.module.stage.course.orgId !== ctx.orgId) throw new NotFoundError("LmsChapter", chapterId);
    return prisma.lmsChapter.update({ where: { id: chapterId }, data });
  }

  static async deleteChapter(ctx: RequestContext, chapterId: string) {
    const ch = await prisma.lmsChapter.findFirst({
      where: { id: chapterId },
      include: { module: { include: { stage: { include: { course: { select: { orgId: true } } } } } } },
    });
    if (!ch || ch.module.stage.course.orgId !== ctx.orgId) throw new NotFoundError("LmsChapter", chapterId);
    await prisma.lmsChapter.delete({ where: { id: chapterId } });
  }

  // ─── Topic CRUD ───────────────────────────────────────────────────────────

  static async createTopic(ctx: RequestContext, chapterId: string, title: string, order?: number) {
    const ch = await prisma.lmsChapter.findFirst({
      where: { id: chapterId },
      include: { module: { include: { stage: { include: { course: { select: { orgId: true } } } } } } },
    });
    if (!ch || ch.module.stage.course.orgId !== ctx.orgId) throw new NotFoundError("LmsChapter", chapterId);
    const nextOrder = order ?? (await prisma.lmsTopic.count({ where: { chapterId } }));
    return prisma.lmsTopic.create({ data: { chapterId, title, order: nextOrder } });
  }

  static async updateTopic(ctx: RequestContext, topicId: string, data: { title?: string; order?: number }) {
    const topic = await prisma.lmsTopic.findFirst({
      where: { id: topicId },
      include: { chapter: { include: { module: { include: { stage: { include: { course: { select: { orgId: true } } } } } } } } },
    });
    if (!topic || topic.chapter.module.stage.course.orgId !== ctx.orgId) throw new NotFoundError("LmsTopic", topicId);
    return prisma.lmsTopic.update({ where: { id: topicId }, data });
  }

  static async deleteTopic(ctx: RequestContext, topicId: string) {
    const topic = await prisma.lmsTopic.findFirst({
      where: { id: topicId },
      include: { chapter: { include: { module: { include: { stage: { include: { course: { select: { orgId: true } } } } } } } } },
    });
    if (!topic || topic.chapter.module.stage.course.orgId !== ctx.orgId) throw new NotFoundError("LmsTopic", topicId);
    await prisma.lmsTopic.delete({ where: { id: topicId } });
  }

  // ─── Content CRUD ─────────────────────────────────────────────────────────

  static async createContent(ctx: RequestContext, topicId: string, data: { title: string; type: "PDF" | "VIDEO" | "NOTES"; url: string; duration?: number | null; order?: number }) {
    const topic = await prisma.lmsTopic.findFirst({
      where: { id: topicId },
      include: { chapter: { include: { module: { include: { stage: { include: { course: { select: { orgId: true } } } } } } } } },
    });
    if (!topic || topic.chapter.module.stage.course.orgId !== ctx.orgId) throw new NotFoundError("LmsTopic", topicId);
    const nextOrder = data.order ?? (await prisma.lmsContent.count({ where: { topicId } }));
    return prisma.lmsContent.create({ data: { topicId, title: data.title, type: data.type, url: data.url, duration: data.duration, order: nextOrder } });
  }

  static async deleteContent(ctx: RequestContext, contentId: string) {
    const content = await prisma.lmsContent.findFirst({
      where: { id: contentId },
      include: { topic: { include: { chapter: { include: { module: { include: { stage: { include: { course: { select: { orgId: true } } } } } } } } } } },
    });
    if (!content || content.topic.chapter.module.stage.course.orgId !== ctx.orgId) throw new NotFoundError("LmsContent", contentId);
    await prisma.lmsContent.delete({ where: { id: contentId } });
  }

  // ─── Question Bank ────────────────────────────────────────────────────────

  static async listQuestions(ctx: RequestContext, moduleId: string) {
    const mod = await prisma.lmsModule.findFirst({
      where: { id: moduleId },
      include: { stage: { include: { course: { select: { orgId: true } } } } },
    });
    if (!mod || mod.stage.course.orgId !== ctx.orgId) throw new NotFoundError("LmsModule", moduleId);
    return prisma.lmsQuestion.findMany({ where: { moduleId }, orderBy: { order: "asc" } });
  }

  static async createQuestion(ctx: RequestContext, input: CreateQuestionInput) {
    const mod = await prisma.lmsModule.findFirst({
      where: { id: input.moduleId },
      include: { stage: { include: { course: { select: { orgId: true } } } } },
    });
    if (!mod || mod.stage.course.orgId !== ctx.orgId) throw new NotFoundError("LmsModule", input.moduleId);
    const nextOrder = input.order ?? (await prisma.lmsQuestion.count({ where: { moduleId: input.moduleId } }));
    return prisma.lmsQuestion.create({
      data: {
        moduleId: input.moduleId,
        stem: input.stem,
        options: input.options as object[],
        correctOptionId: input.correctOptionId,
        order: nextOrder,
        points: input.points ?? 1,
      },
    });
  }

  static async updateQuestion(ctx: RequestContext, questionId: string, input: UpdateQuestionInput) {
    const q = await prisma.lmsQuestion.findFirst({
      where: { id: questionId },
      include: { module: { include: { stage: { include: { course: { select: { orgId: true } } } } } } },
    });
    if (!q || q.module.stage.course.orgId !== ctx.orgId) throw new NotFoundError("LmsQuestion", questionId);
    return prisma.lmsQuestion.update({
      where: { id: questionId },
      data: {
        ...(input.stem !== undefined ? { stem: input.stem } : {}),
        ...(input.options !== undefined ? { options: input.options as object[] } : {}),
        ...(input.correctOptionId !== undefined ? { correctOptionId: input.correctOptionId } : {}),
        ...(input.order !== undefined ? { order: input.order } : {}),
        ...(input.points !== undefined ? { points: input.points } : {}),
      },
    });
  }

  static async deleteQuestion(ctx: RequestContext, questionId: string) {
    const q = await prisma.lmsQuestion.findFirst({
      where: { id: questionId },
      include: { module: { include: { stage: { include: { course: { select: { orgId: true } } } } } } },
    });
    if (!q || q.module.stage.course.orgId !== ctx.orgId) throw new NotFoundError("LmsQuestion", questionId);
    await prisma.lmsQuestion.delete({ where: { id: questionId } });
  }

  // ─── Quiz Attempt (real MCQ engine) ──────────────────────────────────────

  static async submitQuiz(ctx: RequestContext, studentId: string, input: SubmitQuizInput) {
    await this.assertStudentAccess(ctx, studentId);

    const mod = await prisma.lmsModule.findFirst({
      where: { id: input.moduleId },
      include: {
        stage: { include: { course: true } },
        questions: { orderBy: { order: "asc" } },
      },
    });
    if (!mod || mod.stage.course.orgId !== ctx.orgId) throw new NotFoundError("LmsModule", input.moduleId);

    const enrollment = await prisma.lmsEnrollment.findFirst({
      where: { studentId, courseId: mod.stage.course.id, status: "ACTIVE" },
    });
    if (!enrollment) throw new ForbiddenError("read", "lms_courses");

    // Count prior attempts
    const priorAttempts = await prisma.lmsQuizAttempt.count({
      where: { studentId, moduleId: input.moduleId },
    });

    if (priorAttempts >= mod.maxAttempts) {
      throw new ForbiddenError("quiz", `Max ${mod.maxAttempts} attempts reached for this module`);
    }

    // Grade the answers
    let earned = 0;
    let maxScore = 0;
    const gradedAnswers: Record<string, { given: string; correct: string; isCorrect: boolean; points: number }> = {};

    for (const q of mod.questions) {
      maxScore += q.points;
      const given = input.answers[q.id] ?? "";
      const isCorrect = given === q.correctOptionId;
      if (isCorrect) earned += q.points;
      gradedAnswers[q.id] = { given, correct: q.correctOptionId, isCorrect, points: q.points };
    }

    const scorePercent = maxScore > 0 ? Math.round((earned / maxScore) * 100) : 0;
    const passed = scorePercent >= mod.passPercent;

    const attempt = await prisma.lmsQuizAttempt.create({
      data: {
        studentId,
        userId: ctx.user.id,
        moduleId: input.moduleId,
        answers: gradedAnswers,
        score: scorePercent,
        maxScore,
        passed,
        attemptNumber: priorAttempts + 1,
      },
    });

    // Update aggregate LmsAssessment (upsert latest result)
    const existingAssessment = await prisma.lmsAssessment.findUnique({
      where: { studentId_moduleId: { studentId, moduleId: input.moduleId } },
    });

    const newStatus = passed ? "PASS" : scorePercent < mod.passPercent ? "FAIL" : "PENDING";

    if (existingAssessment) {
      await prisma.lmsAssessment.update({
        where: { id: existingAssessment.id },
        data: {
          score: scorePercent,
          status: newStatus,
          attempts: priorAttempts + 1,
          userId: ctx.user.id,
        },
      });
    } else {
      await prisma.lmsAssessment.create({
        data: {
          studentId,
          userId: ctx.user.id,
          moduleId: input.moduleId,
          score: scorePercent,
          status: newStatus,
          attempts: 1,
        },
      });
    }

    return {
      attempt,
      scorePercent,
      earned,
      maxScore,
      passed,
      passPercent: mod.passPercent,
      attemptsUsed: priorAttempts + 1,
      attemptsRemaining: mod.maxAttempts - (priorAttempts + 1),
      gradedAnswers,
    };
  }

  static async getQuizAttempts(ctx: RequestContext, studentId: string, moduleId: string) {
    await this.assertStudentAccess(ctx, studentId);
    return prisma.lmsQuizAttempt.findMany({
      where: { studentId, moduleId },
      orderBy: { createdAt: "asc" },
    });
  }

  // ─── Bookmarks ────────────────────────────────────────────────────────────

  static async toggleBookmark(ctx: RequestContext, studentId: string, input: ToggleBookmarkInput) {
    await this.assertStudentAccess(ctx, studentId);

    const existing = await prisma.lmsBookmark.findUnique({
      where: { studentId_topicId: { studentId, topicId: input.topicId } },
    });

    if (existing) {
      await prisma.lmsBookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false };
    }

    await prisma.lmsBookmark.create({ data: { studentId, topicId: input.topicId } });
    return { bookmarked: true };
  }

  static async listBookmarks(ctx: RequestContext, studentId: string) {
    await this.assertStudentAccess(ctx, studentId);
    return prisma.lmsBookmark.findMany({
      where: { studentId },
      include: { topic: { select: { id: true, title: true, chapterId: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  // ─── Announcements ────────────────────────────────────────────────────────

  static async listAnnouncements(ctx: RequestContext, courseId?: string) {
    return prisma.lmsAnnouncement.findMany({
      where: {
        orgId: ctx.orgId,
        ...(courseId ? { OR: [{ courseId }, { courseId: null }] } : {}),
        publishedAt: { lte: new Date() },
      },
      orderBy: { publishedAt: "desc" },
      take: 20,
    });
  }

  static async createAnnouncement(ctx: RequestContext, input: CreateAnnouncementInput) {
    return prisma.lmsAnnouncement.create({
      data: {
        orgId: ctx.orgId,
        title: input.title,
        body: input.body,
        courseId: input.courseId ?? null,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : new Date(),
        createdBy: ctx.user.id,
      },
    });
  }

  // ─── Enrollments ──────────────────────────────────────────────────────────

  static async enroll(ctx: RequestContext, input: EnrollStudentInput) {
    const [student, course] = await Promise.all([
      prisma.student.findFirst({ where: { id: input.studentId, orgId: ctx.orgId, deletedAt: null } }),
      prisma.lmsCourse.findFirst({ where: { id: input.courseId, orgId: ctx.orgId } }),
    ]);
    if (!student) throw new NotFoundError("Student", input.studentId);
    if (!course) throw new NotFoundError("LmsCourse", input.courseId);

    try {
      return await prisma.lmsEnrollment.create({
        data: {
          orgId: ctx.orgId,
          studentId: input.studentId,
          courseId: input.courseId,
        },
      });
    } catch {
      throw new ConflictError("Student already enrolled in this LMS course");
    }
  }

  static async listEnrollments(ctx: RequestContext, courseId?: string) {
    return prisma.lmsEnrollment.findMany({
      where: { orgId: ctx.orgId, ...(courseId ? { courseId } : {}) },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, studentCode: true, email: true } },
        course: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { enrolledAt: "desc" },
    });
  }

  // ─── Progress ─────────────────────────────────────────────────────────────

  static async markProgress(ctx: RequestContext, studentId: string, input: MarkProgressInput) {
    await this.assertStudentAccess(ctx, studentId);

    const topic = await prisma.lmsTopic.findFirst({
      where: { id: input.topicId },
      include: {
        chapter: {
          include: {
            module: {
              include: { stage: { include: { course: true } } },
            },
          },
        },
      },
    });
    if (!topic || topic.chapter.module.stage.course.orgId !== ctx.orgId) {
      throw new NotFoundError("LmsTopic", input.topicId);
    }

    const enrollment = await prisma.lmsEnrollment.findFirst({
      where: {
        studentId,
        courseId: topic.chapter.module.stage.course.id,
        status: "ACTIVE",
      },
    });
    if (!enrollment) throw new ForbiddenError("read", "lms_progress");

    const percent = input.percent ?? (input.completed ? 100 : 0);

    return prisma.lmsStudentProgress.upsert({
      where: { studentId_topicId: { studentId, topicId: input.topicId } },
      create: {
        studentId,
        userId: ctx.user.id,
        topicId: input.topicId,
        completed: input.completed,
        percent,
        completedAt: input.completed ? new Date() : null,
      },
      update: {
        completed: input.completed,
        percent,
        completedAt: input.completed ? new Date() : null,
        userId: ctx.user.id,
      },
    });
  }

  static async submitAssessment(ctx: RequestContext, studentId: string, input: SubmitAssessmentInput) {
    await this.assertStudentAccess(ctx, studentId);

    const lmsModule = await prisma.lmsModule.findFirst({
      where: { id: input.moduleId },
      include: { stage: { include: { course: true } } },
    });
    if (!lmsModule || lmsModule.stage.course.orgId !== ctx.orgId) {
      throw new NotFoundError("LmsModule", input.moduleId);
    }

    const existing = await prisma.lmsAssessment.findUnique({
      where: { studentId_moduleId: { studentId, moduleId: input.moduleId } },
    });

    if (existing) {
      return prisma.lmsAssessment.update({
        where: { id: existing.id },
        data: {
          score: input.score,
          status: input.status,
          attempts: existing.attempts + 1,
          userId: ctx.user.id,
        },
      });
    }

    return prisma.lmsAssessment.create({
      data: {
        studentId,
        userId: ctx.user.id,
        moduleId: input.moduleId,
        score: input.score,
        status: input.status,
      },
    });
  }

  /** PASS on module assessment unlocks next module (order+1) — state machine core */
  static async getUnlockedModuleIds(ctx: RequestContext, studentId: string, courseId: string) {
    const course = await this.getCourseTree(ctx, courseId);
    const assessments = await prisma.lmsAssessment.findMany({
      where: { studentId, status: "PASS", module: { stage: { courseId } } },
      select: { moduleId: true },
    });
    const passed = new Set(assessments.map((a) => a.moduleId));

    const unlocked: string[] = [];
    for (const stage of course.stages) {
      for (let i = 0; i < stage.modules.length; i++) {
        const mod = stage.modules[i];
        if (!mod) continue;
        if (i === 0) {
          unlocked.push(mod.id);
          continue;
        }
        const prev = stage.modules[i - 1];
        if (prev && passed.has(prev.id)) unlocked.push(mod.id);
      }
    }
    return unlocked;
  }

  // ─── Attendance ───────────────────────────────────────────────────────────

  static async markAttendance(ctx: RequestContext, input: MarkAttendanceInput) {
    const course = await prisma.lmsCourse.findFirst({
      where: { id: input.courseId, orgId: ctx.orgId },
    });
    if (!course) throw new NotFoundError("LmsCourse", input.courseId);

    return prisma.$transaction(async (tx) => {
      const session = await tx.lmsAttendanceSession.create({
        data: {
          orgId: ctx.orgId,
          courseId: input.courseId,
          title: input.title,
          heldAt: input.heldAt ? new Date(input.heldAt) : new Date(),
        },
      });

      await tx.lmsAttendanceRecord.createMany({
        data: input.records.map((r) => ({
          sessionId: session.id,
          studentId: r.studentId,
          status: r.status,
          notes: r.notes,
          markedBy: ctx.user.id,
        })),
      });

      return tx.lmsAttendanceSession.findUnique({
        where: { id: session.id },
        include: { records: true },
      });
    });
  }

  static async getAttendanceForCourse(ctx: RequestContext, courseId: string) {
    const course = await prisma.lmsCourse.findFirst({ where: { id: courseId, orgId: ctx.orgId } });
    if (!course) throw new NotFoundError("LmsCourse", courseId);

    const sessions = await prisma.lmsAttendanceSession.findMany({
      where: { courseId },
      orderBy: { heldAt: "desc" },
      include: {
        records: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true, studentCode: true } },
          },
        },
      },
    });
    return sessions;
  }

  static async getStudentAttendanceSummary(ctx: RequestContext, studentId: string, courseId?: string) {
    await this.assertStudentAccess(ctx, studentId);
    const where = { studentId, ...(courseId ? { session: { courseId } } : { session: { org: { id: ctx.orgId } } }) };
    const records = await prisma.lmsAttendanceRecord.findMany({
      where,
      include: { session: { select: { title: true, heldAt: true, courseId: true } } },
      orderBy: { markedAt: "desc" },
    });
    const total = records.length;
    const present = records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
    const attendancePercent = total > 0 ? Math.round((present / total) * 100) : 0;
    return { records, total, present, attendancePercent };
  }

  // ─── Certificates ─────────────────────────────────────────────────────────

  static async listCertificates(ctx: RequestContext, studentId?: string) {
    return prisma.lmsCertificate.findMany({
      where: {
        orgId: ctx.orgId,
        ...(studentId ? { studentId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        course: { select: { id: true, title: true, slug: true } },
        student: { select: { id: true, firstName: true, lastName: true, studentCode: true } },
      },
    });
  }

  static async issueCertificate(ctx: RequestContext, input: IssueCertificateInput) {
    const [student, course] = await Promise.all([
      prisma.student.findFirst({ where: { id: input.studentId, orgId: ctx.orgId, deletedAt: null } }),
      prisma.lmsCourse.findFirst({ where: { id: input.courseId, orgId: ctx.orgId } }),
    ]);
    if (!student) throw new NotFoundError("Student", input.studentId);
    if (!course) throw new NotFoundError("LmsCourse", input.courseId);

    return prisma.lmsCertificate.create({
      data: {
        orgId: ctx.orgId,
        studentId: input.studentId,
        courseId: input.courseId,
        certificateNo: input.certificateNo,
        verificationCode: input.verificationCode ?? input.certificateNo,
        title: input.title,
        status: "ISSUED",
        issuedAt: new Date(),
        issuedBy: ctx.user.id,
        fileUrl: input.fileUrl,
      },
      include: {
        course: { select: { title: true } },
        student: { select: { firstName: true, lastName: true, studentCode: true } },
      },
    });
  }

  static async verifyCertificate(certificateNo: string) {
    return prisma.lmsCertificate.findFirst({
      where: {
        OR: [{ certificateNo }, { verificationCode: certificateNo }],
        status: "ISSUED",
      },
      include: {
        course: { select: { title: true } },
        student: { select: { firstName: true, lastName: true } },
        org: { select: { name: true } },
      },
    });
  }

  // ─── Student Dashboard ────────────────────────────────────────────────────

  static async studentDashboard(ctx: RequestContext, studentId: string) {
    await this.assertStudentAccess(ctx, studentId);

    const [enrollments, progress, assessments, certificates, attendance, announcements, bookmarks, quizAttempts] = await Promise.all([
      prisma.lmsEnrollment.findMany({
        where: { studentId, orgId: ctx.orgId },
        include: { course: { select: { id: true, title: true, slug: true, isPublished: true } } },
        orderBy: { enrolledAt: "asc" },
      }),
      prisma.lmsStudentProgress.findMany({ where: { studentId } }),
      prisma.lmsAssessment.findMany({
        where: { studentId },
        include: {
          module: {
            select: {
              id: true, title: true, maxAttempts: true, passPercent: true,
              stage: { select: { courseId: true } },
            },
          },
        },
      }),
      prisma.lmsCertificate.findMany({
        where: { studentId, orgId: ctx.orgId, status: "ISSUED" },
        include: { course: { select: { title: true } } },
      }),
      prisma.lmsAttendanceRecord.findMany({
        where: { studentId },
        orderBy: { markedAt: "desc" },
        take: 20,
        include: { session: { select: { title: true, heldAt: true, courseId: true } } },
      }),
      prisma.lmsAnnouncement.findMany({
        where: { orgId: ctx.orgId, publishedAt: { lte: new Date() } },
        orderBy: { publishedAt: "desc" },
        take: 5,
      }),
      prisma.lmsBookmark.findMany({
        where: { studentId },
        include: { topic: { select: { id: true, title: true } } },
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
      prisma.lmsQuizAttempt.findMany({ where: { studentId }, orderBy: { createdAt: "desc" }, take: 20 }),
    ]);

    // Compute attendance %
    const presentCount = attendance.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
    const attendancePercent = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

    // Compute overall completed topics
    const completedTopics = progress.filter((p) => p.completed).length;

    // Per-enrollment percentComplete — one batched query for all enrolled courses
    const enrolledCourseIds = enrollments.map((e) => e.courseId);
    const topicsForCourses = enrolledCourseIds.length > 0
      ? await prisma.lmsTopic.findMany({
          where: { chapter: { module: { stage: { courseId: { in: enrolledCourseIds } } } } },
          select: { id: true, chapter: { select: { module: { select: { stage: { select: { courseId: true } } } } } } },
        })
      : [];

    // Build courseId → topicId[] map
    const courseTopicsMap = new Map<string, string[]>();
    for (const t of topicsForCourses) {
      const cId = t.chapter.module.stage.courseId;
      const arr = courseTopicsMap.get(cId) ?? [];
      arr.push(t.id);
      courseTopicsMap.set(cId, arr);
    }

    // Build topicId → completed map
    const progressCompletedMap = new Map(progress.map((p) => [p.topicId, p.completed]));

    const enrollmentsWithPercent = enrollments.map((e) => {
      const topicIds = courseTopicsMap.get(e.courseId) ?? [];
      const doneCount = topicIds.filter((id) => progressCompletedMap.get(id) === true).length;
      const percentComplete = topicIds.length > 0 ? Math.round((doneCount / topicIds.length) * 100) : 0;
      return { ...e, percentComplete };
    });

    // Prefer in-progress course; else first incomplete; else first enrollment
    const resumeTarget =
      enrollmentsWithPercent.find((e) => e.percentComplete > 0 && e.percentComplete < 100) ??
      enrollmentsWithPercent.find((e) => e.percentComplete < 100) ??
      enrollmentsWithPercent[0];
    const continueLearning = resumeTarget
      ? {
          courseId: resumeTarget.courseId,
          courseTitle: resumeTarget.course.title,
          percentComplete: resumeTarget.percentComplete,
        }
      : null;

    return {
      enrollments: enrollmentsWithPercent,
      progress,
      assessments,
      certificates,
      attendance,
      attendancePercent,
      completedTopics,
      announcements,
      bookmarks,
      quizAttempts,
      continueLearning,
    };
  }

  /** Staff: create STUDENT User + link to CRM Student for portal login. */
  static async provisionPortalAccess(
    ctx: RequestContext,
    input: { studentId: string; password: string },
  ) {
    const student = await prisma.student.findFirst({
      where: { id: input.studentId, orgId: ctx.orgId, deletedAt: null },
    });
    if (!student) throw new NotFoundError("Student", input.studentId);
    if (student.userId) throw new ConflictError("Portal access already provisioned for this student");

    const existingUser = await prisma.user.findFirst({
      where: { orgId: ctx.orgId, email: student.email, deletedAt: null },
    });
    if (existingUser) {
      if (existingUser.role !== "STUDENT") {
        throw new ConflictError("Email already belongs to a non-student user");
      }
      await prisma.student.update({
        where: { id: student.id },
        data: { userId: existingUser.id },
      });
      return { userId: existingUser.id, studentId: student.id, email: student.email, linkedExisting: true };
    }

    const { hash } = await import("argon2");
    const passwordHash = await hash(input.password);
    const user = await prisma.user.create({
      data: {
        orgId: ctx.orgId,
        campusId: student.campusId,
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        phone: student.phone,
        passwordHash,
        role: "STUDENT",
        isActive: true,
      },
    });
    await prisma.student.update({
      where: { id: student.id },
      data: { userId: user.id },
    });
    return { userId: user.id, studentId: student.id, email: student.email, linkedExisting: false };
  }

  static async getMyCoursePlayer(ctx: RequestContext, courseId: string) {
    const student = await this.resolveLinkedStudent(ctx);
    const enrollment = await prisma.lmsEnrollment.findFirst({
      where: { studentId: student.id, courseId, orgId: ctx.orgId, status: "ACTIVE" },
    });
    if (!enrollment) throw new ForbiddenError("read", "lms_courses");

    const [course, progress, assessments, unlockedModuleIds, bookmarks, quizAttempts] = await Promise.all([
      this.getCourseTree(ctx, courseId),
      prisma.lmsStudentProgress.findMany({ where: { studentId: student.id } }),
      prisma.lmsAssessment.findMany({ where: { studentId: student.id } }),
      this.getUnlockedModuleIds(ctx, student.id, courseId),
      prisma.lmsBookmark.findMany({ where: { studentId: student.id }, select: { topicId: true } }),
      prisma.lmsQuizAttempt.findMany({ where: { studentId: student.id, module: { stage: { courseId } } }, orderBy: { createdAt: "asc" } }),
    ]);

    return {
      student,
      enrollment,
      course,
      progress,
      assessments,
      unlockedModuleIds,
      bookmarkedTopicIds: bookmarks.map((b) => b.topicId),
      quizAttempts,
    };
  }

  static async getModuleQuestions(ctx: RequestContext, studentId: string, moduleId: string) {
    await this.assertStudentAccess(ctx, studentId);

    const mod = await prisma.lmsModule.findFirst({
      where: { id: moduleId },
      include: {
        stage: { include: { course: true } },
        questions: { orderBy: { order: "asc" }, select: { id: true, stem: true, options: true, order: true, points: true } },
      },
    });
    if (!mod || mod.stage.course.orgId !== ctx.orgId) throw new NotFoundError("LmsModule", moduleId);

    // Check enrollment
    const enrollment = await prisma.lmsEnrollment.findFirst({
      where: { studentId, courseId: mod.stage.course.id, status: "ACTIVE" },
    });
    if (!enrollment) throw new ForbiddenError("read", "lms_courses");

    // Get attempt count
    const attemptCount = await prisma.lmsQuizAttempt.count({ where: { studentId, moduleId } });

    return {
      module: { id: mod.id, title: mod.title, passPercent: mod.passPercent, maxAttempts: mod.maxAttempts },
      questions: mod.questions,
      attemptsUsed: attemptCount,
      attemptsRemaining: mod.maxAttempts - attemptCount,
    };
  }

  private static async assertStudentAccess(ctx: RequestContext, studentId: string) {
    if (ctx.user.role === "STUDENT") {
      const linked = await prisma.student.findFirst({
        where: { id: studentId, orgId: ctx.orgId, userId: ctx.user.id, deletedAt: null },
        select: { id: true },
      });
      if (!linked) throw new ForbiddenError("read", "lms");
      return;
    }

    const student = await prisma.student.findFirst({
      where: { id: studentId, orgId: ctx.orgId, deletedAt: null },
      select: { id: true },
    });
    if (!student) throw new NotFoundError("Student", studentId);
  }
}
