import { z } from "zod";
import { UserRole } from "@prisma/client";

export const inviteUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(255),
  role: z.nativeEnum(UserRole),
  campusId: z.string().uuid().optional(),
  phone: z.string().max(20).optional(),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(255),
  password: z.string().min(8).max(128),
  role: z.nativeEnum(UserRole),
  campusId: z.string().uuid().optional(),
  phone: z.string().max(20).optional(),
  avatarUrl: z.string().url().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  phone: z.string().max(20).optional(),
  avatarUrl: z.string().url().optional(),
  campusId: z.string().uuid().nullable().optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).max(128),
});

export const userFiltersSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  campusId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().max(255).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "name", "email", "role", "lastLoginAt"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserFilters = z.infer<typeof userFiltersSchema>;
