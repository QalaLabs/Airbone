import { hash } from "argon2";
import { UserRepository } from "@/lib/repositories/user.repository";
import { AuditService } from "@/lib/services/audit.service";
import { ActivityFeedService } from "@/lib/services/activity.service";
import { emitEvent } from "@/lib/events/inngest";
import { generateInviteToken } from "@/lib/utils/crypto";
import { NotFoundError, ConflictError, ForbiddenError } from "@/lib/utils/errors";
import type { InviteUserInput, CreateUserInput, UpdateUserInput, UserFilters } from "@/lib/validations/user.schema";
import type { RequestContext } from "@/types";

export class UserService {
  static async list(ctx: RequestContext, filters: UserFilters) {
    return UserRepository.findMany(ctx.orgId, filters);
  }

  static async getById(ctx: RequestContext, id: string) {
    const user = await UserRepository.findById(ctx.orgId, id);
    if (!user) throw new NotFoundError("User", id);
    return user;
  }

  static async invite(ctx: RequestContext, input: InviteUserInput) {
    const existing = await UserRepository.findByEmail(ctx.orgId, input.email);
    if (existing) throw new ConflictError(`User with email ${input.email} already exists`);

    const inviteToken = generateInviteToken();
    const inviteExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const user = await UserRepository.create(ctx.orgId, {
      email: input.email,
      name: input.name,
      role: input.role,
      campusId: input.campusId,
      phone: input.phone,
      inviteToken,
      inviteExpiry,
      isActive: false,
    });

    await emitEvent({
      name: "user/invited",
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      actorName: ctx.user.name,
      requestId: ctx.requestId,
      timestamp: new Date().toISOString(),
      data: { userId: user.id, email: input.email, role: input.role, inviteToken },
    });

    return { ...user, inviteToken };
  }

  static async create(ctx: RequestContext, input: CreateUserInput) {
    const existing = await UserRepository.findByEmail(ctx.orgId, input.email);
    if (existing) throw new ConflictError(`User with email ${input.email} already exists`);

    const passwordHash = await hash(input.password);

    const user = await UserRepository.create(ctx.orgId, {
      email: input.email,
      name: input.name,
      passwordHash,
      role: input.role,
      campusId: input.campusId,
      phone: input.phone,
      avatarUrl: input.avatarUrl,
      isActive: true,
    });

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
      action: "user.created",
      entityType: "user",
      entityId: user.id,
      newValue: { email: user.email, role: user.role },
    });

    await ActivityFeedService.write({
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      verb: "created",
      objectType: "user",
      objectId: user.id,
      objectSnapshot: { name: user.name, role: user.role },
      context: { actorName: ctx.user.name },
    });

    return user;
  }

  static async update(ctx: RequestContext, id: string, input: UpdateUserInput) {
    const existing = await this.getById(ctx, id);

    // Only SUPER_ADMIN can change roles
    if (input.role && ctx.user.role !== "SUPER_ADMIN") {
      throw new ForbiddenError("change role", "user");
    }

    // Users can update their own profile (non-role fields)
    const isSelf = ctx.user.id === id;
    if (!isSelf && ctx.user.role !== "SUPER_ADMIN" && ctx.user.role !== "ADMIN") {
      throw new ForbiddenError("update", "user");
    }

    const updated = await UserRepository.update(ctx.orgId, id, {
      ...(input.name && { name: input.name }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
      ...(input.campusId !== undefined && { campusId: input.campusId }),
      ...(input.role && { role: input.role }),
      ...(typeof input.isActive === "boolean" && { isActive: input.isActive }),
    });

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
      action: "user.updated",
      entityType: "user",
      entityId: id,
      oldValue: existing as unknown as Record<string, unknown>,
      newValue: updated as unknown as Record<string, unknown>,
    });

    return updated;
  }

  static async deactivate(ctx: RequestContext, id: string) {
    const user = await this.getById(ctx, id);

    // Cannot deactivate yourself
    if (ctx.user.id === id) {
      throw new ForbiddenError("deactivate", "own account");
    }

    await UserRepository.softDelete(ctx.orgId, id);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
      action: "user.deactivated",
      entityType: "user",
      entityId: id,
      oldValue: { isActive: true },
      newValue: { isActive: false },
    });

    await ActivityFeedService.write({
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      verb: "deactivated",
      objectType: "user",
      objectId: id,
      objectSnapshot: { name: user.name },
      context: { actorName: ctx.user.name },
    });

    return { ok: true };
  }

  static async acceptInvite(token: string, password: string) {
    const user = await UserRepository.findByInviteToken(token);
    if (!user) throw new NotFoundError("Invite", token);

    const passwordHash = await hash(password);
    return UserRepository.acceptInvite(user.id, passwordHash);
  }
}
