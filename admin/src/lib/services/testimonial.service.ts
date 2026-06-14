import { TestimonialRepository } from "@/lib/repositories/testimonial.repository";
import { AuditService } from "@/lib/services/audit.service";
import { ActivityFeedService } from "@/lib/services/activity.service";
import { emitEvent } from "@/lib/events/inngest";
import { NotFoundError, ValidationError } from "@/lib/utils/errors";
import type {
  CreateTestimonialInput,
  UpdateTestimonialInput,
  ReviewTestimonialInput,
  TestimonialFilters,
} from "@/lib/validations/testimonial.schema";
import type { RequestContext } from "@/types";

export class TestimonialService {
  static async list(ctx: RequestContext, filters: TestimonialFilters) {
    return TestimonialRepository.findMany(ctx.orgId, filters);
  }

  static async getById(ctx: RequestContext, id: string) {
    const testimonial = await TestimonialRepository.findById(ctx.orgId, id);
    if (!testimonial) throw new NotFoundError("Testimonial", id);
    return testimonial;
  }

  static async create(ctx: RequestContext, input: CreateTestimonialInput) {
    const testimonial = await TestimonialRepository.create(ctx.orgId, input);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "testimonial.submitted",
      entityType: "testimonial",
      entityId: testimonial.id,
      newValue: { authorName: input.authorName, courseId: input.courseId },
    });

    await ActivityFeedService.write({
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      verb: "submitted",
      objectType: "testimonial",
      objectId: testimonial.id,
      objectSnapshot: { authorName: input.authorName },
      context: { actorName: ctx.user.name },
    });

    await emitEvent({
      name: "testimonial/submitted",
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      actorName: ctx.user.name,
      requestId: ctx.requestId,
      timestamp: new Date().toISOString(),
      data: { testimonialId: testimonial.id, authorName: input.authorName, courseId: input.courseId },
    });

    return testimonial;
  }

  static async update(ctx: RequestContext, id: string, input: UpdateTestimonialInput) {
    const existing = await this.getById(ctx, id);
    const updated = await TestimonialRepository.update(ctx.orgId, id, input);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "testimonial.updated",
      entityType: "testimonial",
      entityId: id,
      oldValue: { authorName: existing.authorName },
      newValue: { authorName: input.authorName ?? existing.authorName },
    });

    return updated;
  }

  // Approval workflow
  static async review(ctx: RequestContext, id: string, input: ReviewTestimonialInput) {
    const existing = await this.getById(ctx, id);

    if (existing.status !== "PENDING") {
      throw new ValidationError([
        { message: `Testimonial already ${existing.status}. Only PENDING testimonials can be reviewed.` },
      ]);
    }

    const updated = await TestimonialRepository.review(
      ctx.orgId,
      id,
      input.status,
      ctx.user.id,
      input.reviewNotes,
    );

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: `testimonial.${input.status.toLowerCase()}`,
      entityType: "testimonial",
      entityId: id,
      oldValue: { status: existing.status },
      newValue: { status: input.status, reviewNotes: input.reviewNotes },
    });

    await ActivityFeedService.write({
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      verb: input.status === "APPROVED" ? "approved" : "rejected",
      objectType: "testimonial",
      objectId: id,
      objectSnapshot: { authorName: existing.authorName, status: input.status },
      context: { actorName: ctx.user.name },
    });

    await emitEvent({
      name: "testimonial/reviewed",
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      actorName: ctx.user.name,
      requestId: ctx.requestId,
      timestamp: new Date().toISOString(),
      data: { testimonialId: id, status: input.status, reviewedBy: ctx.user.id },
    });

    return updated;
  }

  static async delete(ctx: RequestContext, id: string) {
    const existing = await this.getById(ctx, id);
    await TestimonialRepository.delete(ctx.orgId, id);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "testimonial.deleted",
      entityType: "testimonial",
      entityId: id,
      oldValue: { authorName: existing.authorName, status: existing.status },
    });
  }

  static async getPendingCount(ctx: RequestContext) {
    return TestimonialRepository.findPendingCount(ctx.orgId);
  }
}
