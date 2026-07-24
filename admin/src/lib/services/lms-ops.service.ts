import { prisma } from "@/lib/db/client";
import type { RequestContext } from "@/types";
import { NotFoundError, ForbiddenError, ConflictError } from "@/lib/utils/errors";
import type {
  CreateBatchInput,
  UpdateBatchInput,
  CreateTimetableSlotInput,
  UpdateTimetableSlotInput,
  CreateAssignmentInput,
  UpdateAssignmentInput,
  BulkCurriculumImportInput,
} from "@/lib/validations/lms.schema";

/** Phase C: batches, timetable, assignments, faculty helpers */
export class LmsOpsService {
  // ─── Batches ──────────────────────────────────────────────────────────────

  static async listBatches(ctx: RequestContext, courseId?: string) {
    return prisma.lmsBatch.findMany({
      where: { orgId: ctx.orgId, ...(courseId ? { courseId } : {}) },
      orderBy: { createdAt: "desc" },
      include: {
        course: { select: { id: true, title: true } },
        _count: { select: { students: true, teachers: true, timetableSlots: true } },
        teachers: {
          include: { teacher: { select: { id: true, name: true, email: true } } },
        },
      },
    });
  }

  static async getBatch(ctx: RequestContext, batchId: string) {
    const batch = await prisma.lmsBatch.findFirst({
      where: { id: batchId, orgId: ctx.orgId },
      include: {
        course: { select: { id: true, title: true } },
        teachers: {
          include: { teacher: { select: { id: true, name: true, email: true, role: true } } },
        },
        students: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true, studentCode: true, email: true } },
          },
        },
        timetableSlots: {
          orderBy: { startsAt: "asc" },
          include: { teacher: { select: { id: true, name: true } } },
        },
      },
    });
    if (!batch) throw new NotFoundError("LmsBatch", batchId);
    return batch;
  }

  static async createBatch(ctx: RequestContext, input: CreateBatchInput) {
    const course = await prisma.lmsCourse.findFirst({ where: { id: input.courseId, orgId: ctx.orgId } });
    if (!course) throw new NotFoundError("LmsCourse", input.courseId);
    return prisma.lmsBatch.create({
      data: {
        orgId: ctx.orgId,
        courseId: input.courseId,
        name: input.name,
        type: input.type ?? "CUSTOM",
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        capacity: input.capacity ?? null,
      },
    });
  }

  static async updateBatch(ctx: RequestContext, batchId: string, input: UpdateBatchInput) {
    const batch = await prisma.lmsBatch.findFirst({ where: { id: batchId, orgId: ctx.orgId } });
    if (!batch) throw new NotFoundError("LmsBatch", batchId);
    return prisma.lmsBatch.update({
      where: { id: batchId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.startDate !== undefined
          ? { startDate: input.startDate ? new Date(input.startDate) : null }
          : {}),
        ...(input.endDate !== undefined ? { endDate: input.endDate ? new Date(input.endDate) : null } : {}),
        ...(input.capacity !== undefined ? { capacity: input.capacity } : {}),
      },
    });
  }

  static async deleteBatch(ctx: RequestContext, batchId: string) {
    const batch = await prisma.lmsBatch.findFirst({ where: { id: batchId, orgId: ctx.orgId } });
    if (!batch) throw new NotFoundError("LmsBatch", batchId);
    await prisma.lmsBatch.delete({ where: { id: batchId } });
  }

  static async setBatchMembers(
    ctx: RequestContext,
    batchId: string,
    data: { studentIds?: string[]; teacherIds?: string[] },
  ) {
    const batch = await prisma.lmsBatch.findFirst({ where: { id: batchId, orgId: ctx.orgId } });
    if (!batch) throw new NotFoundError("LmsBatch", batchId);

    await prisma.$transaction(async (tx) => {
      if (data.studentIds) {
        await tx.lmsBatchStudent.deleteMany({ where: { batchId } });
        if (data.studentIds.length) {
          await tx.lmsBatchStudent.createMany({
            data: data.studentIds.map((studentId) => ({ batchId, studentId })),
            skipDuplicates: true,
          });
          // Keep course enrollment in sync
          for (const studentId of data.studentIds) {
            await tx.lmsEnrollment.upsert({
              where: { studentId_courseId: { studentId, courseId: batch.courseId } },
              create: {
                orgId: ctx.orgId,
                studentId,
                courseId: batch.courseId,
                batchId,
                status: "ACTIVE",
              },
              update: { batchId, status: "ACTIVE" },
            });
          }
        }
      }
      if (data.teacherIds) {
        await tx.lmsBatchTeacher.deleteMany({ where: { batchId } });
        if (data.teacherIds.length) {
          await tx.lmsBatchTeacher.createMany({
            data: data.teacherIds.map((teacherId) => ({ batchId, teacherId })),
            skipDuplicates: true,
          });
          for (const teacherId of data.teacherIds) {
            await tx.lmsCourseTeacher.upsert({
              where: { teacherId_courseId: { teacherId, courseId: batch.courseId } },
              create: { teacherId, courseId: batch.courseId },
              update: {},
            });
          }
        }
      }
    });

    return this.getBatch(ctx, batchId);
  }

  // ─── Timetable ────────────────────────────────────────────────────────────

  static async listTimetable(
    ctx: RequestContext,
    opts: { batchId?: string; teacherId?: string; from?: string; to?: string } = {},
  ) {
    const from = opts.from ? new Date(opts.from) : new Date();
    const to = opts.to ? new Date(opts.to) : new Date(Date.now() + 14 * 86400000);

    // Faculty scoped: only their batches/slots
    let teacherFilter = opts.teacherId;
    if (ctx.user.role === "TEACHER") {
      teacherFilter = ctx.user.id;
    }

    return prisma.lmsTimetableSlot.findMany({
      where: {
        orgId: ctx.orgId,
        startsAt: { gte: from, lte: to },
        ...(opts.batchId ? { batchId: opts.batchId } : {}),
        ...(teacherFilter ? { teacherId: teacherFilter } : {}),
      },
      orderBy: { startsAt: "asc" },
      include: {
        batch: { select: { id: true, name: true, type: true } },
        teacher: { select: { id: true, name: true } },
        course: { select: { id: true, title: true } },
      },
    });
  }

  static async createTimetableSlot(ctx: RequestContext, input: CreateTimetableSlotInput) {
    const batch = await prisma.lmsBatch.findFirst({ where: { id: input.batchId, orgId: ctx.orgId } });
    if (!batch) throw new NotFoundError("LmsBatch", input.batchId);
    const startsAt = new Date(input.startsAt);
    const endsAt = new Date(input.endsAt);
    if (endsAt <= startsAt) throw new ConflictError("endsAt must be after startsAt");

    return prisma.lmsTimetableSlot.create({
      data: {
        orgId: ctx.orgId,
        batchId: input.batchId,
        courseId: input.courseId ?? batch.courseId,
        teacherId: input.teacherId || null,
        title: input.title,
        startsAt,
        endsAt,
        room: input.room || null,
        onlineUrl: input.onlineUrl || null,
        subjectTag: input.subjectTag || null,
      },
    });
  }

  static async updateTimetableSlot(ctx: RequestContext, slotId: string, input: UpdateTimetableSlotInput) {
    const slot = await prisma.lmsTimetableSlot.findFirst({ where: { id: slotId, orgId: ctx.orgId } });
    if (!slot) throw new NotFoundError("LmsTimetableSlot", slotId);
    return prisma.lmsTimetableSlot.update({
      where: { id: slotId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.teacherId !== undefined ? { teacherId: input.teacherId || null } : {}),
        ...(input.courseId !== undefined ? { courseId: input.courseId || null } : {}),
        ...(input.startsAt !== undefined ? { startsAt: new Date(input.startsAt) } : {}),
        ...(input.endsAt !== undefined ? { endsAt: new Date(input.endsAt) } : {}),
        ...(input.room !== undefined ? { room: input.room || null } : {}),
        ...(input.onlineUrl !== undefined ? { onlineUrl: input.onlineUrl || null } : {}),
        ...(input.subjectTag !== undefined ? { subjectTag: input.subjectTag || null } : {}),
      },
    });
  }

  static async deleteTimetableSlot(ctx: RequestContext, slotId: string) {
    const slot = await prisma.lmsTimetableSlot.findFirst({ where: { id: slotId, orgId: ctx.orgId } });
    if (!slot) throw new NotFoundError("LmsTimetableSlot", slotId);
    await prisma.lmsTimetableSlot.delete({ where: { id: slotId } });
  }

  // ─── Assignments ──────────────────────────────────────────────────────────

  static async listAssignments(ctx: RequestContext, opts: { courseId?: string; batchId?: string } = {}) {
    return prisma.lmsAssignment.findMany({
      where: {
        orgId: ctx.orgId,
        ...(opts.courseId ? { courseId: opts.courseId } : {}),
        ...(opts.batchId ? { batchId: opts.batchId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        course: { select: { id: true, title: true } },
        batch: { select: { id: true, name: true } },
        _count: { select: { submissions: true } },
      },
    });
  }

  static async createAssignment(ctx: RequestContext, input: CreateAssignmentInput) {
    const course = await prisma.lmsCourse.findFirst({ where: { id: input.courseId, orgId: ctx.orgId } });
    if (!course) throw new NotFoundError("LmsCourse", input.courseId);
    return prisma.lmsAssignment.create({
      data: {
        orgId: ctx.orgId,
        courseId: input.courseId,
        batchId: input.batchId || null,
        moduleId: input.moduleId || null,
        title: input.title,
        description: input.description || null,
        dueAt: input.dueAt ? new Date(input.dueAt) : null,
        maxScore: input.maxScore ?? 100,
        status: input.status ?? "DRAFT",
        createdBy: ctx.user.id,
      },
    });
  }

  static async updateAssignment(ctx: RequestContext, id: string, input: UpdateAssignmentInput) {
    const a = await prisma.lmsAssignment.findFirst({ where: { id, orgId: ctx.orgId } });
    if (!a) throw new NotFoundError("LmsAssignment", id);
    return prisma.lmsAssignment.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.batchId !== undefined ? { batchId: input.batchId || null } : {}),
        ...(input.moduleId !== undefined ? { moduleId: input.moduleId || null } : {}),
        ...(input.dueAt !== undefined ? { dueAt: input.dueAt ? new Date(input.dueAt) : null } : {}),
        ...(input.maxScore !== undefined ? { maxScore: input.maxScore } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });
  }

  static async submitAssignment(
    ctx: RequestContext,
    studentId: string,
    data: { assignmentId: string; fileUrl?: string | null; body?: string | null },
  ) {
    const assignment = await prisma.lmsAssignment.findFirst({
      where: { id: data.assignmentId, orgId: ctx.orgId, status: "PUBLISHED" },
    });
    if (!assignment) throw new NotFoundError("LmsAssignment", data.assignmentId);

    return prisma.lmsAssignmentSubmission.upsert({
      where: { assignmentId_studentId: { assignmentId: data.assignmentId, studentId } },
      create: {
        assignmentId: data.assignmentId,
        studentId,
        fileUrl: data.fileUrl || null,
        body: data.body || null,
        status: "SUBMITTED",
      },
      update: {
        fileUrl: data.fileUrl || null,
        body: data.body || null,
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });
  }

  static async gradeSubmission(
    ctx: RequestContext,
    submissionId: string,
    data: { score: number; feedback?: string | null; status?: "GRADED" | "RETURNED" },
  ) {
    const sub = await prisma.lmsAssignmentSubmission.findFirst({
      where: { id: submissionId },
      include: { assignment: true },
    });
    if (!sub || sub.assignment.orgId !== ctx.orgId) throw new NotFoundError("LmsAssignmentSubmission", submissionId);
    if (data.score > sub.assignment.maxScore) {
      throw new ConflictError(`Score cannot exceed maxScore (${sub.assignment.maxScore})`);
    }
    return prisma.lmsAssignmentSubmission.update({
      where: { id: submissionId },
      data: {
        score: data.score,
        feedback: data.feedback ?? null,
        status: data.status ?? "GRADED",
        gradedAt: new Date(),
        gradedBy: ctx.user.id,
      },
    });
  }

  // ─── Faculty dashboard ────────────────────────────────────────────────────

  static async facultyDashboard(ctx: RequestContext) {
    if (ctx.user.role !== "TEACHER" && ctx.user.role !== "ADMIN" && ctx.user.role !== "SUPER_ADMIN") {
      throw new ForbiddenError("read", "lms");
    }

    const teacherId = ctx.user.role === "TEACHER" ? ctx.user.id : undefined;
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const batches = await prisma.lmsBatch.findMany({
      where: {
        orgId: ctx.orgId,
        ...(teacherId ? { teachers: { some: { teacherId } } } : {}),
      },
      include: {
        course: { select: { id: true, title: true } },
        _count: { select: { students: true } },
      },
    });

    const todayClasses = await prisma.lmsTimetableSlot.findMany({
      where: {
        orgId: ctx.orgId,
        startsAt: { gte: new Date(now.toDateString()), lte: endOfDay },
        ...(teacherId ? { teacherId } : {}),
      },
      orderBy: { startsAt: "asc" },
      include: {
        batch: { select: { id: true, name: true } },
        course: { select: { id: true, title: true } },
      },
    });

    const assignments = await prisma.lmsAssignment.findMany({
      where: {
        orgId: ctx.orgId,
        status: { in: ["PUBLISHED", "DRAFT"] },
        ...(teacherId
          ? { OR: [{ createdBy: teacherId }, { batch: { teachers: { some: { teacherId } } } }] }
          : {}),
      },
      take: 10,
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { submissions: true } }, course: { select: { title: true } } },
    });

    const studentIds = (
      await prisma.lmsBatchStudent.findMany({
        where: { batchId: { in: batches.map((b) => b.id) } },
        select: { studentId: true },
      })
    ).map((s) => s.studentId);

    return {
      batches,
      todayClasses,
      assignments,
      studentCount: new Set(studentIds).size,
    };
  }

  static async facultyStudents(ctx: RequestContext) {
    const teacherId = ctx.user.role === "TEACHER" ? ctx.user.id : undefined;
    const memberships = await prisma.lmsBatchStudent.findMany({
      where: {
        batch: {
          orgId: ctx.orgId,
          ...(teacherId ? { teachers: { some: { teacherId } } } : {}),
        },
      },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, studentCode: true, email: true, status: true },
        },
        batch: { select: { id: true, name: true, type: true, courseId: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return memberships;
  }

  // ─── Bulk curriculum import ───────────────────────────────────────────────

  static async bulkImportCurriculum(ctx: RequestContext, courseId: string, input: BulkCurriculumImportInput) {
    const course = await prisma.lmsCourse.findFirst({ where: { id: courseId, orgId: ctx.orgId } });
    if (!course) throw new NotFoundError("LmsCourse", courseId);

    const stageCount = await prisma.lmsStage.count({ where: { courseId } });

    return prisma.$transaction(async (tx) => {
      const created = [];
      for (let si = 0; si < input.stages.length; si++) {
        const s = input.stages[si]!;
        const stage = await tx.lmsStage.create({
          data: { courseId, title: s.title, order: stageCount + si },
        });
        for (let mi = 0; mi < (s.modules?.length ?? 0); mi++) {
          const m = s.modules![mi]!;
          const mod = await tx.lmsModule.create({
            data: { stageId: stage.id, title: m.title, order: mi },
          });
          for (let ci = 0; ci < (m.chapters?.length ?? 0); ci++) {
            const c = m.chapters![ci]!;
            const ch = await tx.lmsChapter.create({
              data: { moduleId: mod.id, title: c.title, order: ci },
            });
            for (let ti = 0; ti < (c.topics?.length ?? 0); ti++) {
              const t = c.topics![ti]!;
              const topic = await tx.lmsTopic.create({
                data: { chapterId: ch.id, title: t.title, order: ti },
              });
              for (let xi = 0; xi < (t.contents?.length ?? 0); xi++) {
                const x = t.contents![xi]!;
                await tx.lmsContent.create({
                  data: {
                    topicId: topic.id,
                    title: x.title,
                    type: x.type,
                    url: x.url || "#",
                    body: x.body || null,
                    order: xi,
                  },
                });
              }
            }
          }
        }
        created.push(stage.id);
      }
      return { stageIds: created };
    });
  }

  // ─── Student timetable + attendance breakdowns ────────────────────────────

  static async studentUpcomingLectures(ctx: RequestContext, studentId: string) {
    const batchIds = (
      await prisma.lmsBatchStudent.findMany({
        where: { studentId, batch: { orgId: ctx.orgId } },
        select: { batchId: true },
      })
    ).map((b) => b.batchId);

    if (!batchIds.length) return [];

    return prisma.lmsTimetableSlot.findMany({
      where: {
        orgId: ctx.orgId,
        batchId: { in: batchIds },
        startsAt: { gte: new Date() },
      },
      orderBy: { startsAt: "asc" },
      take: 20,
      include: {
        teacher: { select: { name: true } },
        batch: { select: { name: true, type: true } },
        course: { select: { title: true } },
      },
    });
  }

  static async studentAttendanceBreakdown(ctx: RequestContext, studentId: string) {
    const records = await prisma.lmsAttendanceRecord.findMany({
      where: { studentId, session: { orgId: ctx.orgId } },
      include: {
        session: {
          select: {
            heldAt: true,
            title: true,
            subjectTag: true,
            courseId: true,
            course: { select: { title: true } },
          },
        },
      },
      orderBy: { markedAt: "desc" },
    });

    const overallTotal = records.length;
    const overallPresent = records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
    const overallPercent = overallTotal ? Math.round((overallPresent / overallTotal) * 100) : 0;

    const byMonth = new Map<string, { total: number; present: number }>();
    const bySubject = new Map<string, { total: number; present: number }>();

    for (const r of records) {
      const d = new Date(r.session.heldAt);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const subjectKey = r.session.subjectTag || r.session.course.title || "General";
      const isPresent = r.status === "PRESENT" || r.status === "LATE";

      const m = byMonth.get(monthKey) ?? { total: 0, present: 0 };
      m.total += 1;
      if (isPresent) m.present += 1;
      byMonth.set(monthKey, m);

      const s = bySubject.get(subjectKey) ?? { total: 0, present: 0 };
      s.total += 1;
      if (isPresent) s.present += 1;
      bySubject.set(subjectKey, s);
    }

    return {
      overallPercent,
      overallTotal,
      overallPresent,
      monthly: [...byMonth.entries()].map(([month, v]) => ({
        month,
        percent: v.total ? Math.round((v.present / v.total) * 100) : 0,
        ...v,
      })),
      bySubject: [...bySubject.entries()].map(([subject, v]) => ({
        subject,
        percent: v.total ? Math.round((v.present / v.total) * 100) : 0,
        ...v,
      })),
      records,
    };
  }
}
