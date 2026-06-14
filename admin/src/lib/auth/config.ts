import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/client";
import { z } from "zod";
import { authConfig } from "./auth.config";
import type { UserRole } from "@prisma/client";
import type { SessionUser } from "@/types";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  orgSlug: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        orgSlug: { label: "Organization", type: "text" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password, orgSlug } = parsed.data;

        const org = await prisma.organization.findUnique({
          where: { slug: orgSlug, isActive: true },
          select: { id: true },
        });
        if (!org) return null;

        const user = await prisma.user.findFirst({
          where: { email, orgId: org.id, isActive: true, deletedAt: null },
          select: {
            id: true,
            orgId: true,
            campusId: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
            passwordHash: true,
          },
        });
        if (!user?.passwordHash) return null;

        // argon2 verify (Node.js only, never runs on Edge)
        const argon2 = await import("argon2");
        const valid = await argon2.verify(user.passwordHash, password);
        if (!valid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          orgId: user.orgId,
          campusId: user.campusId,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        };
      },
    }),
  ],

  events: {
    async signIn({ user }) {
      const u = user as unknown as SessionUser;
      if (u.orgId) {
        const { AuditService } = await import("@/lib/services/audit.service");
        await AuditService.write({
          orgId: u.orgId,
          userId: u.id,
          action: "user.login",
          entityType: "user",
          entityId: u.id,
        });
      }
    },
  },
});

// ─── Type augmentation ───────────────────────────────────────────────────────

declare module "next-auth" {
  interface Session {
    user: SessionUser & {
      id: string;
      email: string;
      name: string;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    orgId: string;
    campusId: string | null;
    role: UserRole;
    avatarUrl: string | null;
  }
}
