import { prisma } from "@/lib/db/client";
import type { LeadFilters, CreateLeadInput, UpdateLeadInput } from "@/lib/validations/lead.schema";
import type { Prisma } from "@prisma/client";

const LEAD_SELECT = {
  id: true,
  orgId: true,
  campusId: true,
  name: true,
  email: true,
  phone: true,
  city: true,
  state: true,
  courseInterest: true,
  source: true,
  status: true,
  score: true,
  tags: true,
  assignedTo: true,
  createdBy: true,
  utmSource: true,
  utmMedium: true,
  utmCampaign: true,
  utmTerm: true,
  utmContent: true,
  referrerUrl: true,
  landingPage: true,
  isDuplicate: true,
  nextFollowUp: true,
  lastActivityAt: true,
  convertedAt: true,
  lostReason: true,
  customFields: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
  counselor: { select: { id: true, name: true, avatarUrl: true, email: true } },
  campus: { select: { id: true, name: true, city: true } },
} satisfies Prisma.LeadSelect;

export class LeadRepository {
  static async findMany(orgId: string, filters: LeadFilters) {
    const where: Prisma.LeadWhereInput = {
      orgId,
      deletedAt: null,
    };

    if (filters.status) where.status = filters.status;
    if (filters.source) where.source = filters.source;
    if (filters.assignedTo) where.assignedTo = filters.assignedTo;
    if (filters.campusId) where.campusId = filters.campusId;
    if (filters.courseInterest) {
      where.courseInterest = { contains: filters.courseInterest, mode: "insensitive" };
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { phone: { contains: filters.search } },
      ];
    }
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {
        ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
        ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
      };
    }

    const skip = (filters.page - 1) * filters.limit;

    const [data, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        select: LEAD_SELECT,
        orderBy: { [filters.sortBy]: filters.sortDir },
        skip,
        take: filters.limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return { data, total };
  }

  static async findById(orgId: string, id: string) {
    return prisma.lead.findFirst({
      where: { id, orgId, deletedAt: null },
      select: LEAD_SELECT,
    });
  }

  static async findByPhone(orgId: string, phone: string, excludeId?: string) {
    return prisma.lead.findFirst({
      where: { orgId, phone, deletedAt: null, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true, name: true, phone: true },
    });
  }

  static async create(orgId: string, createdBy: string, data: CreateLeadInput) {
    return prisma.lead.create({
      data: {
        orgId,
        createdBy,
        name: data.name,
        email: data.email || null,
        phone: data.phone,
        city: data.city,
        state: data.state,
        courseInterest: data.courseInterest,
        source: data.source,
        assignedTo: data.assignedTo,
        campusId: data.campusId,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        utmTerm: data.utmTerm,
        utmContent: data.utmContent,
        referrerUrl: data.referrerUrl || null,
        landingPage: data.landingPage,
        tags: data.tags ?? [],
        customFields: (data.customFields ?? {}) as Prisma.InputJsonValue,
        nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp) : null,
      },
      select: LEAD_SELECT,
    });
  }

  static async update(orgId: string, id: string, data: UpdateLeadInput) {
    return prisma.lead.update({
      where: { id, orgId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.state !== undefined && { state: data.state }),
        ...(data.courseInterest !== undefined && { courseInterest: data.courseInterest }),
        ...(data.source !== undefined && { source: data.source }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.assignedTo !== undefined && { assignedTo: data.assignedTo }),
        ...(data.campusId !== undefined && { campusId: data.campusId ?? null }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.customFields !== undefined && { customFields: data.customFields as Prisma.InputJsonValue }),
        ...(data.lostReason !== undefined && { lostReason: data.lostReason }),
        ...(data.nextFollowUp !== undefined && {
          nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp) : null,
        }),
      } as Prisma.LeadUncheckedUpdateInput,
      select: LEAD_SELECT,
    });
  }

  static async softDelete(orgId: string, id: string) {
    return prisma.lead.update({
      where: { id, orgId },
      data: { deletedAt: new Date() },
      select: { id: true },
    });
  }

  static async getStatusCounts(orgId: string) {
    return prisma.lead.groupBy({
      by: ["status"],
      where: { orgId, deletedAt: null },
      _count: { status: true },
    });
  }

  static async getSourceCounts(orgId: string) {
    return prisma.lead.groupBy({
      by: ["source"],
      where: { orgId, deletedAt: null },
      _count: { source: true },
    });
  }
}
