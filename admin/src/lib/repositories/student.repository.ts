import { prisma } from "@/lib/db/client";
import type { Prisma } from "@prisma/client";
import type { StudentFilters, CreateStudentInput, UpdateStudentInput } from "@/lib/validations/student.schema";

const STUDENT_SELECT = {
  id: true,
  orgId: true,
  campusId: true,
  leadId: true,
  studentCode: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  dateOfBirth: true,
  gender: true,
  nationality: true,
  address: true,
  guardianName: true,
  guardianPhone: true,
  guardianEmail: true,
  medicalFitness: true,
  class10Board: true,
  class10Year: true,
  class10Percent: true,
  class12Board: true,
  class12Year: true,
  class12Percent: true,
  class12Stream: true,
  status: true,
  enrolledAt: true,
  graduatedAt: true,
  droppedAt: true,
  customFields: true,
  createdAt: true,
  updatedAt: true,
  campus: { select: { id: true, name: true, code: true, city: true } },
} satisfies Prisma.StudentSelect;

export class StudentRepository {
  static async findMany(orgId: string, filters: StudentFilters) {
    const where: Prisma.StudentWhereInput = {
      orgId,
      deletedAt: null,
      ...(filters.status && { status: filters.status }),
      ...(filters.campusId && { campusId: filters.campusId }),
      ...(filters.search && {
        OR: [
          { firstName: { contains: filters.search, mode: "insensitive" } },
          { lastName: { contains: filters.search, mode: "insensitive" } },
          { email: { contains: filters.search, mode: "insensitive" } },
          { phone: { contains: filters.search } },
          { studentCode: { contains: filters.search, mode: "insensitive" } },
        ],
      }),
      ...(filters.dateFrom || filters.dateTo
        ? {
            createdAt: {
              ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
              ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
            },
          }
        : {}),
    };

    const skip = (filters.page - 1) * filters.limit;
    const orderBy = { [filters.sortBy]: filters.sortDir } as Prisma.StudentOrderByWithRelationInput;

    const [data, total] = await Promise.all([
      prisma.student.findMany({ where, select: STUDENT_SELECT, skip, take: filters.limit, orderBy }),
      prisma.student.count({ where }),
    ]);
    return { data, total };
  }

  static async findById(orgId: string, id: string) {
    return prisma.student.findFirst({
      where: { id, orgId, deletedAt: null },
      select: STUDENT_SELECT,
    });
  }

  static async findByEmail(orgId: string, email: string, excludeId?: string) {
    return prisma.student.findFirst({
      where: {
        orgId,
        email: email.toLowerCase(),
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
  }

  static async findByLeadId(orgId: string, leadId: string) {
    return prisma.student.findFirst({
      where: { orgId, leadId },
      select: { id: true, studentCode: true },
    });
  }

  static async getNextCode(orgId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.student.count({ where: { orgId } });
    const seq = String(count + 1).padStart(4, "0");
    return `AAA-${year}-${seq}`;
  }

  static async create(orgId: string, data: CreateStudentInput & { studentCode: string }) {
    return prisma.student.create({
      data: {
        orgId,
        studentCode: data.studentCode,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender,
        nationality: data.nationality,
        address: (data.address ?? {}) as Prisma.InputJsonValue,
        guardianName: data.guardianName,
        guardianPhone: data.guardianPhone,
        guardianEmail: data.guardianEmail,
        medicalFitness: data.medicalFitness,
        class10Board: data.class10Board,
        class10Year: data.class10Year,
        class10Percent: data.class10Percent,
        class12Board: data.class12Board,
        class12Year: data.class12Year,
        class12Percent: data.class12Percent,
        class12Stream: data.class12Stream,
        campusId: data.campusId,
        leadId: data.leadId,
        customFields: (data.customFields ?? {}) as Prisma.InputJsonValue,
      },
      select: STUDENT_SELECT,
    });
  }

  static async update(orgId: string, id: string, data: UpdateStudentInput) {
    return prisma.student.update({
      where: { id, orgId },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.email !== undefined && { email: data.email.toLowerCase() }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.dateOfBirth !== undefined && { dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null }),
        ...(data.gender !== undefined && { gender: data.gender }),
        ...(data.nationality !== undefined && { nationality: data.nationality }),
        ...(data.address !== undefined && { address: data.address as Prisma.InputJsonValue }),
        ...(data.guardianName !== undefined && { guardianName: data.guardianName }),
        ...(data.guardianPhone !== undefined && { guardianPhone: data.guardianPhone }),
        ...(data.guardianEmail !== undefined && { guardianEmail: data.guardianEmail }),
        ...(data.medicalFitness !== undefined && { medicalFitness: data.medicalFitness }),
        ...(data.class10Board !== undefined && { class10Board: data.class10Board }),
        ...(data.class10Year !== undefined && { class10Year: data.class10Year }),
        ...(data.class10Percent !== undefined && { class10Percent: data.class10Percent }),
        ...(data.class12Board !== undefined && { class12Board: data.class12Board }),
        ...(data.class12Year !== undefined && { class12Year: data.class12Year }),
        ...(data.class12Percent !== undefined && { class12Percent: data.class12Percent }),
        ...(data.class12Stream !== undefined && { class12Stream: data.class12Stream }),
        ...(data.campusId !== undefined && { campusId: data.campusId }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.enrolledAt !== undefined && { enrolledAt: data.enrolledAt ? new Date(data.enrolledAt) : null }),
        ...(data.graduatedAt !== undefined && { graduatedAt: data.graduatedAt ? new Date(data.graduatedAt) : null }),
        ...(data.droppedAt !== undefined && { droppedAt: data.droppedAt ? new Date(data.droppedAt) : null }),
        ...(data.customFields !== undefined && { customFields: data.customFields as Prisma.InputJsonValue }),
      },
      select: STUDENT_SELECT,
    });
  }

  static async softDelete(orgId: string, id: string) {
    return prisma.student.update({
      where: { id, orgId },
      data: { deletedAt: new Date() },
      select: { id: true },
    });
  }
}
