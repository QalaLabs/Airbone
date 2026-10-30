import { prisma } from "@/lib/db/client";
import { AuditService } from "@/lib/services/audit.service";
import { resolveCourseSlug } from "@/lib/courses/eligibility";
import type { LeadSource } from "@prisma/client";

export interface AutoAssignResult {
  assignedTo: string | null;
  rule: "CADET_SHIVANGI" | "CPL_ROUND_ROBIN" | "NONE";
  counselorName: string | null;
  exception?: string;
}

export class LeadAssignmentService {
  /**
   * Determine if a course interest represents a Cadet lead.
   * Canonical checks + alias matching for all variations including Arabic/localized strings.
   */
  static isCadetCourse(courseInterest: string | null | undefined): boolean {
    if (!courseInterest) return false;
    const slug = resolveCourseSlug(courseInterest);
    if (slug === "cadet-preparation") return true;
    const lower = courseInterest.toLowerCase().trim();
    return (
      lower.includes("cadet") ||
      lower.includes("متدرب") || // Arabic: إعداد الطيارين المتدربين
      lower.includes("airline prep")
    );
  }

  /**
   * Determine if a course interest represents a CPL lead.
   */
  static isCPLCourse(courseInterest: string | null | undefined): boolean {
    if (!courseInterest) return false;
    const slug = resolveCourseSlug(courseInterest);
    if (slug === "commercial-pilot-license-cpl" || slug === "ground-school") return true;
    const lower = courseInterest.toLowerCase().trim();
    return (
      lower.includes("cpl") ||
      lower.includes("commercial pilot")
    );
  }

  /**
   * Authoritative backend automatic lead routing.
   * Rules (30 Oct 2026 client feedback):
   * - Cadet leads → Shivangi (fixed assignment, exception if inactive)
   * - CPL leads   → Round-robin: Piyush → Shivangi → Other active counselors (concurrency safe)
   * - Other leads → None (preserve manual ownership)
   */
  static async autoAssign(
    ctx: {
      orgId: string;
      userId?: string | null;
      userName?: string | null;
      requestId?: string | null;
      ipAddress?: string | null;
    },
    lead: {
      id: string;
      courseInterest: string | null | undefined;
      source: LeadSource | string;
      assignedTo?: string | null;
    }
  ): Promise<AutoAssignResult> {
    // If the lead already has an assigned counselor (e.g., set explicitly on creation),
    // preserve manual ownership unless unassigned.
    if (lead.assignedTo) {
      return { assignedTo: lead.assignedTo, rule: "NONE", counselorName: null };
    }

    const isCadet = this.isCadetCourse(lead.courseInterest);
    const isCPL = this.isCPLCourse(lead.courseInterest);

    if (!isCadet && !isCPL) {
      return { assignedTo: null, rule: "NONE", counselorName: null };
    }

    // ── A. Cadet Routing: Shivangi ──────────────────────────────────────────
    if (isCadet) {
      // Find Shivangi (active admissions counselor)
      const shivangi = await prisma.user.findFirst({
        where: {
          orgId: ctx.orgId,
          role: "ADMISSIONS_COUNSELOR",
          isActive: true,
          deletedAt: null,
          OR: [
            { email: { in: ["sr@airborneaviation.in", "shivangi@airborne.academy"] } },
            { name: { contains: "Shivangi", mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true },
        orderBy: { createdAt: "asc" },
      });

      if (!shivangi) {
        // Shivangi is inactive or unavailable: record visible exception
        await prisma.leadActivity.create({
          data: {
            leadId: lead.id,
            orgId: ctx.orgId,
            performedBy: ctx.userId ?? undefined,
            activityType: "NOTE",
            title: "Auto-assignment exception: Shivangi unavailable",
            notes: "Cadet lead auto-assignment exception: counselor Shivangi is inactive or not found in organization. Lead remains unassigned for manual review.",
            completedAt: new Date(),
          },
        });

        await AuditService.write({
          orgId: ctx.orgId,
          userId: ctx.userId ?? undefined,
          requestId: ctx.requestId ?? undefined,
          ipAddress: ctx.ipAddress ?? undefined,
          action: "lead.assignment_exception",
          entityType: "lead",
          entityId: lead.id,
          newValue: {
            rule: "CADET_SHIVANGI",
            reason: "counselor_unavailable",
            course: lead.courseInterest,
          },
        });

        return {
          assignedTo: null,
          rule: "CADET_SHIVANGI",
          counselorName: null,
          exception: "Shivangi unavailable",
        };
      }

      // Assign to Shivangi
      await prisma.lead.update({
        where: { id: lead.id },
        data: { assignedTo: shivangi.id, lastActivityAt: new Date() },
      });

      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          orgId: ctx.orgId,
          performedBy: ctx.userId ?? shivangi.id,
          activityType: "ASSIGNMENT",
          title: `Assigned to ${shivangi.name}`,
          notes: `Auto-assigned: Cadet lead routed to ${shivangi.name} per Cadet assignment rule.`,
          completedAt: new Date(),
          metadata: {
            rule: "CADET_SHIVANGI",
            counselorId: shivangi.id,
            counselorName: shivangi.name,
            courseInterest: lead.courseInterest,
          },
        },
      });

      await AuditService.write({
        orgId: ctx.orgId,
        userId: ctx.userId ?? undefined,
        requestId: ctx.requestId ?? undefined,
        ipAddress: ctx.ipAddress ?? undefined,
        action: "lead.assigned",
        entityType: "lead",
        entityId: lead.id,
        newValue: {
          counselorId: shivangi.id,
          counselorName: shivangi.name,
          rule: "cadet_auto",
          course: lead.courseInterest,
        },
      });

      return {
        assignedTo: shivangi.id,
        rule: "CADET_SHIVANGI",
        counselorName: shivangi.name,
      };
    }

    // ── B. CPL Round-Robin Routing: Piyush → Shivangi → Other Active Counselors
    if (isCPL) {
      // Find all active counselors in the organization
      const activeCounselors = await prisma.user.findMany({
        where: {
          orgId: ctx.orgId,
          role: "ADMISSIONS_COUNSELOR",
          isActive: true,
          deletedAt: null,
        },
        select: { id: true, name: true, email: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      });

      if (activeCounselors.length === 0) {
        await prisma.leadActivity.create({
          data: {
            leadId: lead.id,
            orgId: ctx.orgId,
            performedBy: ctx.userId ?? undefined,
            activityType: "NOTE",
            title: "Auto-assignment exception: no active counselors",
            notes: "CPL lead auto-assignment exception: no active admissions counselors available. Lead remains unassigned.",
            completedAt: new Date(),
          },
        });

        await AuditService.write({
          orgId: ctx.orgId,
          userId: ctx.userId ?? undefined,
          requestId: ctx.requestId ?? undefined,
          ipAddress: ctx.ipAddress ?? undefined,
          action: "lead.assignment_exception",
          entityType: "lead",
          entityId: lead.id,
          newValue: {
            rule: "CPL_ROUND_ROBIN",
            reason: "no_active_counselors",
            course: lead.courseInterest,
          },
        });

        return {
          assignedTo: null,
          rule: "CPL_ROUND_ROBIN",
          counselorName: null,
          exception: "No active counselors available",
        };
      }

      // Order pool strictly: 1. Piyush, 2. Shivangi, 3. Other active counselors
      const piyush = activeCounselors.find(
        (c) =>
          c.name.toLowerCase().includes("piyush") ||
          c.email.toLowerCase().includes("piyush") ||
          c.email === "pc@airborneaviation.in"
      );
      const shivangi = activeCounselors.find(
        (c) =>
          c.name.toLowerCase().includes("shivangi") ||
          c.email.toLowerCase().includes("shivangi") ||
          c.email === "sr@airborneaviation.in"
      );
      const others = activeCounselors.filter(
        (c) => c.id !== piyush?.id && c.id !== shivangi?.id
      );

      const pool: { id: string; name: string }[] = [];
      if (piyush) pool.push(piyush);
      if (shivangi) pool.push(shivangi);
      for (const o of others) {
        pool.push(o);
      }

      // Atomic, concurrency-safe assignment with row-level lock on organization
      const assigned = await prisma.$transaction(async (tx) => {
        // Exclusive lock on organization to prevent concurrent cursor race conditions
        const orgRows = await tx.$queryRaw<{ id: string; settings: any }[]>`
          SELECT id, settings FROM "organizations" WHERE id = ${ctx.orgId}::uuid FOR UPDATE
        `;
        const org = orgRows[0];
        const settings = (org?.settings as Record<string, any>) || {};
        const cursor = typeof settings.cplRotationCursor === "number" ? settings.cplRotationCursor : 0;

        const index = cursor % pool.length;
        const selectedCounselor = pool[index];
        if (!selectedCounselor) {
          throw new Error(`Failed to resolve counselor at index ${index} in pool of ${pool.length}`);
        }
        const nextCursor = (cursor + 1) % 1_000_000;

        // Assign the lead
        await tx.lead.update({
          where: { id: lead.id },
          data: { assignedTo: selectedCounselor.id, lastActivityAt: new Date() },
        });

        // Record assignment activity
        await tx.leadActivity.create({
          data: {
            leadId: lead.id,
            orgId: ctx.orgId,
            performedBy: ctx.userId ?? selectedCounselor.id,
            activityType: "ASSIGNMENT",
            title: `Assigned to ${selectedCounselor.name}`,
            notes: `Auto-assigned via CPL Round-Robin (position ${index + 1} of ${pool.length} active counselors).`,
            completedAt: new Date(),
            metadata: {
              rule: "CPL_ROUND_ROBIN",
              rotationIndex: index,
              rotationCursor: cursor,
              poolSize: pool.length,
              counselorId: selectedCounselor.id,
              counselorName: selectedCounselor.name,
              courseInterest: lead.courseInterest,
            },
          },
        });

        // Persist advanced cursor in organization settings
        await tx.organization.update({
          where: { id: ctx.orgId },
          data: {
            settings: {
              ...settings,
              cplRotationCursor: nextCursor,
            },
          },
        });

        return { selectedCounselor, index, poolSize: pool.length };
      });

      // Write durable audit log outside transaction
      await AuditService.write({
        orgId: ctx.orgId,
        userId: ctx.userId ?? undefined,
        requestId: ctx.requestId ?? undefined,
        ipAddress: ctx.ipAddress ?? undefined,
        action: "lead.assigned",
        entityType: "lead",
        entityId: lead.id,
        newValue: {
          counselorId: assigned.selectedCounselor.id,
          counselorName: assigned.selectedCounselor.name,
          rule: "cpl_round_robin",
          rotationIndex: assigned.index,
          poolSize: assigned.poolSize,
          course: lead.courseInterest,
        },
      });

      return {
        assignedTo: assigned.selectedCounselor.id,
        rule: "CPL_ROUND_ROBIN",
        counselorName: assigned.selectedCounselor.name,
      };
    }

    return { assignedTo: null, rule: "NONE", counselorName: null };
  }
}
