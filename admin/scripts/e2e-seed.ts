// Deterministic fixtures for the admin E2E suite. Refuses to run against
// anything but the loopback disposable test database (safe-db-check).
// Synthetic users and data only — the password below is a test-only value.
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { assertSafeDatabaseUrl } from "./safe-db-check.mjs";

export const E2E_PASSWORD = "E2e-Only-Password-1";
export const E2E_USERS = {
  superAdmin: { email: "e2e-superadmin@example.test", name: "E2E Super Admin", role: "SUPER_ADMIN" as const, isActive: true },
  staff: { email: "e2e-staff@example.test", name: "E2E Staff Member", role: "ADMIN" as const, isActive: true },
  inactive: { email: "e2e-inactive@example.test", name: "E2E Inactive User", role: "SUPPORT_STAFF" as const, isActive: false },
};
export const E2E_COURSE_SLUG = "e2e-fee-course";
export const E2E_PENDING_TESTIMONIALS = 25;

async function main() {
  console.log(`[e2e-seed] ${assertSafeDatabaseUrl(process.env)}`);
  const prisma = new PrismaClient();
  try {
    const org = await prisma.organization.findFirst({ where: { slug: "airborne-aviation" }, select: { id: true } });
    if (!org) throw new Error("Org airborne-aviation missing — run the base seed on the disposable DB first.");

    const passwordHash = await argon2.hash(E2E_PASSWORD);
    for (const u of Object.values(E2E_USERS)) {
      await prisma.user.upsert({
        where: { email_orgId: { email: u.email, orgId: org.id } },
        create: { orgId: org.id, email: u.email, name: u.name, role: u.role, isActive: u.isActive, passwordHash },
        update: { name: u.name, role: u.role, isActive: u.isActive, passwordHash, deletedAt: null },
      });
    }

    await prisma.course.upsert({
      where: { orgId_slug: { orgId: org.id, slug: E2E_COURSE_SLUG } },
      create: { orgId: org.id, slug: E2E_COURSE_SLUG, title: "E2E Fee Course", status: "PUBLISHED", fee: 60000 },
      update: { title: "E2E Fee Course", status: "PUBLISHED", fee: 60000 },
    });

    await prisma.testimonial.deleteMany({ where: { orgId: org.id, authorName: { startsWith: "E2E " } } });
    await prisma.testimonial.createMany({
      data: Array.from({ length: E2E_PENDING_TESTIMONIALS }, (_, i) => ({
        orgId: org.id,
        authorName: `E2E Pending ${String(i + 1).padStart(2, "0")}`,
        content: `Synthetic pending testimonial number ${i + 1} for end-to-end tests.`,
        status: "PENDING" as const,
        source: "e2e",
      })),
    });

    const pending = await prisma.testimonial.count({ where: { orgId: org.id, status: "PENDING" } });
    console.log(`[e2e-seed] users=${Object.keys(E2E_USERS).length} pendingTestimonials=${pending}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("[e2e-seed] failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
