import { type NextRequest } from "next/server";
import { getRequestContext } from "@/lib/middleware/context";
import { prisma } from "@/lib/db/client";
import { ok, handleError } from "@/lib/utils/response";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  phone: z.string().max(20).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
});

export async function GET(_req: NextRequest) {
  try {
    const ctx = await getRequestContext();
    const user = await prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        campusId: true,
        createdAt: true,
      },
    });
    return ok(user);
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ctx = await getRequestContext();
    const body = await req.json();
    const input = updateProfileSchema.parse(body);

    const updated = await prisma.user.update({
      where: { id: ctx.user.id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        campusId: true,
      },
    });

    return ok(updated);
  } catch (err) {
    return handleError(err);
  }
}
