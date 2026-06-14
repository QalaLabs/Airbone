import { prisma } from "@/lib/db/client";
import type { Prisma } from "@prisma/client";
import type { UserFilters } from "@/lib/validations/user.schema";

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  phone: true,
  avatarUrl: true,
  campusId: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  campus: { select: { id: true, name: true, code: true } },
} satisfies Prisma.UserSelect;

export class UserRepository {
  static async findMany(orgId: string, filters: UserFilters) {
    const where: Prisma.UserWhereInput = {
      orgId,
      deletedAt: null,
      ...(filters.role && { role: filters.role }),
      ...(filters.campusId && { campusId: filters.campusId }),
      ...(typeof filters.isActive === "boolean" && { isActive: filters.isActive }),
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: "insensitive" } },
          { email: { contains: filters.search, mode: "insensitive" } },
        ],
      }),
    };

    const skip = (filters.page - 1) * filters.limit;
    const orderBy = { [filters.sortBy]: filters.sortDir } as Prisma.UserOrderByWithRelationInput;

    const [data, total] = await Promise.all([
      prisma.user.findMany({ where, select: USER_SELECT, skip, take: filters.limit, orderBy }),
      prisma.user.count({ where }),
    ]);

    return { data, total };
  }

  static async findById(orgId: string, id: string) {
    return prisma.user.findFirst({
      where: { id, orgId, deletedAt: null },
      select: USER_SELECT,
    });
  }

  static async findByEmail(orgId: string, email: string) {
    return prisma.user.findFirst({
      where: { email: email.toLowerCase(), orgId, deletedAt: null },
    });
  }

  static async findByInviteToken(token: string) {
    return prisma.user.findFirst({
      where: { inviteToken: token, inviteExpiry: { gt: new Date() } },
    });
  }

  static async create(
    orgId: string,
    data: {
      email: string;
      name: string;
      passwordHash?: string;
      role: string;
      campusId?: string;
      phone?: string;
      avatarUrl?: string;
      inviteToken?: string;
      inviteExpiry?: Date;
      isActive?: boolean;
    },
  ) {
    return prisma.user.create({
      data: {
        orgId,
        email: data.email.toLowerCase(),
        name: data.name,
        passwordHash: data.passwordHash,
        role: data.role as never,
        campusId: data.campusId,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        inviteToken: data.inviteToken,
        inviteExpiry: data.inviteExpiry,
        isActive: data.isActive ?? false,
      },
      select: USER_SELECT,
    });
  }

  static async update(orgId: string, id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id, orgId },
      data,
      select: USER_SELECT,
    });
  }

  static async softDelete(orgId: string, id: string) {
    return prisma.user.update({
      where: { id, orgId },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  static async acceptInvite(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        isActive: true,
        inviteToken: null,
        inviteExpiry: null,
        emailVerified: new Date(),
      },
      select: USER_SELECT,
    });
  }
}
