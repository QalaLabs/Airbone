import type { UserRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
      orgId: string;
      campusId: string | null;
      role: UserRole;
      avatarUrl: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    orgId?: string;
    campusId?: string | null;
    role?: UserRole;
    avatarUrl?: string | null;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      orgId: string;
      campusId: string | null;
      role: UserRole;
      avatarUrl: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    orgId?: string;
    campusId?: string | null;
    role?: UserRole;
    avatarUrl?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    orgId?: string;
    campusId?: string | null;
    role?: UserRole;
    avatarUrl?: string | null;
  }
}
