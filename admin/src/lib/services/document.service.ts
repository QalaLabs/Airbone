import { DocumentRepository } from "@/lib/repositories/document.repository";
import { AuditService } from "@/lib/services/audit.service";
import { ActivityFeedService } from "@/lib/services/activity.service";
import { emitEvent } from "@/lib/events/inngest";
import { NotFoundError, ForbiddenError } from "@/lib/utils/errors";
import { prisma } from "@/lib/db/client";
import type { UploadDocumentInput, ReviewDocumentInput, DocumentFilters } from "@/lib/validations/document.schema";
import type { RequestContext } from "@/types";

export class DocumentService {
  static async list(ctx: RequestContext, filters: DocumentFilters) {
    return DocumentRepository.findMany(ctx.orgId, filters);
  }

  static async getById(ctx: RequestContext, id: string) {
    const doc = await DocumentRepository.findById(ctx.orgId, id);
    if (!doc) throw new NotFoundError("Document", id);
    return doc;
  }

  // Generate a presigned R2 upload URL (caller gets URL, uploads directly, then calls upload())
  static async getPresignedUrl(
    _ctx: RequestContext,
    fileName: string,
    contentType: string,
  ): Promise<{ uploadUrl: string; fileKey: string; fileUrl: string }> {
    const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL } = process.env;

    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "R2 storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME.",
        );
      }
      // Dev-only mock response
      const fileKey = `documents/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      return {
        uploadUrl: `http://localhost:4000/api/v1/upload-mock?key=${encodeURIComponent(fileKey)}`,
        fileKey,
        fileUrl: `${R2_PUBLIC_URL ?? "http://localhost:4000/_mock"}/${fileKey}`,
      };
    }

    // Real R2 presigned URL via AWS SDK v3
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

    const client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
    });

    const fileKey = `documents/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const command = new PutObjectCommand({ Bucket: R2_BUCKET_NAME, Key: fileKey, ContentType: contentType });
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });

    return {
      uploadUrl,
      fileKey,
      fileUrl: `${R2_PUBLIC_URL}/${fileKey}`,
    };
  }

  static async upload(ctx: RequestContext, input: UploadDocumentInput) {
    // Verify admission/student belong to this org
    if (input.admissionId) {
      const admission = await prisma.admission.findFirst({
        where: { id: input.admissionId, orgId: ctx.orgId },
      });
      if (!admission) throw new NotFoundError("Admission", input.admissionId);
    }

    if (input.studentId) {
      const student = await prisma.student.findFirst({
        where: { id: input.studentId, orgId: ctx.orgId, deletedAt: null },
      });
      if (!student) throw new NotFoundError("Student", input.studentId);
    }

    const doc = await DocumentRepository.create(ctx.orgId, ctx.user.id, input);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
      action: "document.uploaded",
      entityType: "document",
      entityId: doc.id,
      newValue: { name: doc.name, documentType: doc.documentType, admissionId: input.admissionId },
    });

    await ActivityFeedService.write({
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      verb: "uploaded",
      objectType: "document",
      objectId: doc.id,
      objectSnapshot: { name: doc.name, documentType: doc.documentType },
      targetType: input.admissionId ? "admission" : input.studentId ? "student" : undefined,
      targetId: input.admissionId ?? input.studentId,
      context: { actorName: ctx.user.name },
    });

    await emitEvent({
      name: "document/uploaded",
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      actorName: ctx.user.name,
      requestId: ctx.requestId,
      timestamp: new Date().toISOString(),
      data: {
        documentId: doc.id,
        admissionId: input.admissionId,
        studentId: input.studentId,
        documentType: doc.documentType,
        name: doc.name,
      },
    });

    return doc;
  }

  static async review(ctx: RequestContext, id: string, input: ReviewDocumentInput) {
    const doc = await this.getById(ctx, id);

    // Only ADMIN/ORG_ADMIN can approve/reject
    if (input.status !== "UNDER_REVIEW") {
      const canApprove = ["SUPER_ADMIN", "ADMIN"].includes(ctx.user.role);
      if (!canApprove) throw new ForbiddenError("approve", "documents");
    }

    if (input.status === "REJECTED" && !input.rejectionReason) {
      throw new Error("rejectionReason is required when rejecting a document");
    }

    const updated = await DocumentRepository.review(
      ctx.orgId,
      id,
      ctx.user.id,
      input.status,
      input.rejectionReason,
    );

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
      action: `document.${input.status.toLowerCase()}`,
      entityType: "document",
      entityId: id,
      oldValue: { status: doc.status },
      newValue: { status: input.status, rejectionReason: input.rejectionReason },
    });

    await ActivityFeedService.write({
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      verb: input.status === "APPROVED" ? "approved" : input.status === "REJECTED" ? "rejected" : "marked_under_review",
      objectType: "document",
      objectId: id,
      objectSnapshot: { name: doc.name, documentType: doc.documentType },
      context: { actorName: ctx.user.name, status: input.status },
    });

    await emitEvent({
      name: "document/reviewed",
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      actorName: ctx.user.name,
      requestId: ctx.requestId,
      timestamp: new Date().toISOString(),
      data: {
        documentId: id,
        admissionId: doc.admissionId ?? undefined,
        studentId: doc.studentId ?? undefined,
        status: input.status,
        reviewedBy: ctx.user.id,
      },
    });

    return updated;
  }
}
