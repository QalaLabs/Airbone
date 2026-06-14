import type { UserRole } from "@prisma/client";

// ─── API Response Envelope ───────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  cursor?: string;
}

// ─── Auth / Session ──────────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  orgId: string;
  campusId: string | null;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
}

export interface AuthSession {
  user: SessionUser;
  expires: string;
}

// ─── Request Context ─────────────────────────────────────────────────────────

export interface RequestContext {
  user: SessionUser;
  orgId: string;
  requestId: string;
  ipAddress: string;
  userAgent: string;
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

// ─── Events ─────────────────────────────────────────────────────────────────

export interface BaseEvent {
  orgId: string;
  actorId: string;
  actorName: string;
  requestId: string;
  ipAddress?: string;
  timestamp: string;
}

export interface LeadCreatedEvent extends BaseEvent {
  name: "lead/created";
  data: { leadId: string; leadName: string; source: string; courseInterest?: string };
}

export interface LeadStatusChangedEvent extends BaseEvent {
  name: "lead/status.changed";
  data: { leadId: string; leadName: string; oldStatus: string; newStatus: string };
}

export interface LeadAssignedEvent extends BaseEvent {
  name: "lead/assigned";
  data: { leadId: string; leadName: string; counselorId: string; counselorName: string };
}

export interface LeadActivityCreatedEvent extends BaseEvent {
  name: "lead/activity.created";
  data: { leadId: string; leadName: string; activityId: string; activityType: string };
}

export interface UserInvitedEvent extends BaseEvent {
  name: "user/invited";
  data: { userId: string; email: string; role: string; inviteToken: string };
}

export interface AdmissionCreatedEvent extends BaseEvent {
  name: "admission/created";
  data: { admissionId: string; applicationNo: string; leadId: string; leadName: string; campusId?: string };
}

export interface AdmissionStageChangedEvent extends BaseEvent {
  name: "admission/stage.changed";
  data: { admissionId: string; applicationNo: string; fromStage: string; toStage: string; studentId?: string };
}

export interface PaymentReceivedEvent extends BaseEvent {
  name: "payment/received";
  data: { paymentId: string; admissionId: string; studentId?: string; amount: string; method: string; receiptNo?: string };
}

export interface DocumentUploadedEvent extends BaseEvent {
  name: "document/uploaded";
  data: { documentId: string; admissionId?: string; studentId?: string; documentType: string; name: string };
}

export interface DocumentReviewedEvent extends BaseEvent {
  name: "document/reviewed";
  data: { documentId: string; admissionId?: string; studentId?: string; status: string; reviewedBy: string };
}

// ─── Sprint 3 — CMS Events ───────────────────────────────────────────────────

export interface MediaUploadedEvent extends BaseEvent {
  name: "media/uploaded";
  data: { assetId: string; name: string; mimeType: string; folderId?: string };
}

export interface MediaReplacedEvent extends BaseEvent {
  name: "media/replaced";
  data: { assetId: string; oldFileKey: string; newFileKey: string };
}

export interface MediaDeletedEvent extends BaseEvent {
  name: "media/deleted";
  data: { assetId: string; name: string };
}

export interface PageStatusChangedEvent extends BaseEvent {
  name: "page/status.changed";
  data: { pageId: string; slug: string; fromStatus: string; toStatus: string; version: number; scheduledAt?: string };
}

export interface PagePublishedEvent extends BaseEvent {
  name: "page/published";
  data: { pageId: string; slug: string; version: number; versionId: string };
}

export interface CourseStatusChangedEvent extends BaseEvent {
  name: "course/status.changed";
  data: { courseId: string; slug: string; title: string; fromStatus: string; toStatus: string; scheduledAt?: string };
}

export interface CoursePublishedEvent extends BaseEvent {
  name: "course/published";
  data: { courseId: string; slug: string; title: string; version: number; versionId: string };
}

export interface ContentVersionCreatedEvent extends BaseEvent {
  name: "content/version.created";
  data: { entityType: "page" | "course"; entityId: string; version: number; versionId: string; notes?: string };
}

export interface CmsScheduledCheckEvent extends BaseEvent {
  name: "cms/scheduled.check";
  data: Record<string, never>;
}

// ─── Sprint 4 — Business Content Events ──────────────────────────────────────

export interface ResourcePublishedEvent extends BaseEvent {
  name: "resource/published";
  data: { resourceId: string; slug: string; title: string; type: string };
}

export interface ResourceStatusChangedEvent extends BaseEvent {
  name: "resource/status.changed";
  data: { resourceId: string; slug: string; fromStatus: string; toStatus: string };
}

export interface JobPublishedEvent extends BaseEvent {
  name: "job/published";
  data: { jobId: string; slug: string; title: string; hiringPartnerId?: string };
}

export interface JobStatusChangedEvent extends BaseEvent {
  name: "job/status.changed";
  data: { jobId: string; slug: string; fromStatus: string; toStatus: string };
}

export interface JobApplicationSubmittedEvent extends BaseEvent {
  name: "job_application/submitted";
  data: { applicationId: string; jobId: string; jobTitle: string; applicantName: string; applicantEmail: string };
}

export interface JobApplicationStatusChangedEvent extends BaseEvent {
  name: "job_application/status.changed";
  data: { applicationId: string; jobId: string; fromStatus: string; toStatus: string; applicantEmail: string };
}

export interface PlacementCreatedEvent extends BaseEvent {
  name: "placement/created";
  data: { placementId: string; studentId: string; jobTitle: string; hiringPartnerId?: string };
}

export interface PlacementUpdatedEvent extends BaseEvent {
  name: "placement/updated";
  data: { placementId: string; studentId: string; status: string };
}

export interface TestimonialSubmittedEvent extends BaseEvent {
  name: "testimonial/submitted";
  data: { testimonialId: string; authorName: string; courseId?: string };
}

export interface TestimonialReviewedEvent extends BaseEvent {
  name: "testimonial/reviewed";
  data: { testimonialId: string; status: string; reviewedBy: string };
}

export type AppEvent =
  | LeadCreatedEvent
  | LeadStatusChangedEvent
  | LeadAssignedEvent
  | LeadActivityCreatedEvent
  | UserInvitedEvent
  | AdmissionCreatedEvent
  | AdmissionStageChangedEvent
  | PaymentReceivedEvent
  | DocumentUploadedEvent
  | DocumentReviewedEvent
  | MediaUploadedEvent
  | MediaReplacedEvent
  | MediaDeletedEvent
  | PageStatusChangedEvent
  | PagePublishedEvent
  | CourseStatusChangedEvent
  | CoursePublishedEvent
  | ContentVersionCreatedEvent
  | CmsScheduledCheckEvent
  | ResourcePublishedEvent
  | ResourceStatusChangedEvent
  | JobPublishedEvent
  | JobStatusChangedEvent
  | JobApplicationSubmittedEvent
  | JobApplicationStatusChangedEvent
  | PlacementCreatedEvent
  | PlacementUpdatedEvent
  | TestimonialSubmittedEvent
  | TestimonialReviewedEvent;
