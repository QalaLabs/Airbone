import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/client";
import { authConfig } from "./auth.config";
import { refreshTokenClaims } from "./token-refresh";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  orgSlug: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "airborne-admin-local-dev-auth-secret-key-32chars",
  adapter: PrismaAdapter(prisma),

  callbacks: {
    // Inject custom claims into the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.orgId = user.orgId;
        token.campusId = user.campusId;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.avatarUrl = user.avatarUrl;
        return token;
      }
      // Every session read re-loads role/campus/active state from the DB, so
      // demotions and deactivations apply to all open sessions immediately.
      // Wrapped in try-catch so a DB outage returns a stale token instead of 500.
      try {
        const refreshed = await refreshTokenClaims(token, (id) =>
          prisma.user.findFirst({
            where: { id, isActive: true, deletedAt: null },
            select: { id: true, orgId: true, campusId: true, role: true, name: true, email: true, avatarUrl: true },
          }),
        );
        return refreshed ?? token;
      } catch (err) {
        console.error("[NextAuth jwt] DB unreachable, returning stale token:", err instanceof Error ? err.message : err);
        return token;
      }
    },

    // Copy the custom JWT fields into the session user (Node.js only)
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.orgId = token.orgId as string;
        session.user.campusId = (token.campusId as string) || null;
        session.user.role = token.role as any;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.avatarUrl = (token.avatarUrl as string) || null;
      }
      return session;
    },
  },

  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        orgSlug: { label: "Organization", type: "text" },
      },
      async authorize(credentials) {
        try {
          const parsed = credentialsSchema.safeParse(credentials);
          if (!parsed.success) {
            console.error("[authorize] Invalid credentials input:", parsed.error.format());
            return null;
          }

          const { email, password, orgSlug } = parsed.data;

          const org = await prisma.organization.findFirst({
            where: { slug: orgSlug, isActive: true },
            select: { id: true },
          });
          if (!org) {
            console.error("[authorize] Organization not found or inactive:", orgSlug);
            return null;
          }

          const user = await prisma.user.findFirst({
            where: { email, orgId: org.id, isActive: true, deletedAt: null },
            select: {
              id: true,
              orgId: true,
              campusId: true,
              role: true,
              name: true,
              email: true,
              avatarUrl: true,
              passwordHash: true,
            },
          });
          if (!user) {
            console.error("[authorize] User not found for email:", email, "in org:", orgSlug);
            return null;
          }
          if (!user.passwordHash) {
            console.error("[authorize] User has no passwordHash set:", email);
            return null;
          }

          // argon2 verify (Node.js only, never runs on Edge)
          const argon2 = await import("argon2");
          const valid = await argon2.verify(user.passwordHash, password);
          if (!valid) {
            console.error("[authorize] Invalid password (argon2 verification failed) for:", email);
            return null;
          }

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
        } catch (err) {
          console.error("[authorize] Login crashed with exception:", err instanceof Error ? err.stack || err.message : err);
          return null;
        }
      },
    }),
  ],
});
