import { serve } from "inngest/next";
import { inngest } from "@/lib/events/inngest";
import {
  onLeadCreated,
  onLeadStatusChanged,
  onLeadAssigned,
  onLeadActivityCreated,
} from "@/lib/events/functions/lead.functions";
import { onUserInvited } from "@/lib/events/functions/user.functions";
import {
  onAdmissionCreated,
  onAdmissionStageChanged,
  onPaymentReceived,
  onDocumentUploaded,
  onDocumentReviewed,
} from "@/lib/events/functions/admission.functions";
import {
  onMediaUploaded,
  onMediaReplaced,
  onMediaDeleted,
  onPagePublished,
  onPageStatusChanged,
  onCoursePublished,
  onCourseStatusChanged,
  onContentVersionCreated,
  onCmsScheduledCheck,
} from "@/lib/events/functions/cms.functions";
import {
  onResourcePublished,
  onResourceStatusChanged,
  onJobPublished,
  onJobStatusChanged,
  onJobApplicationSubmitted,
  onJobApplicationStatusChanged,
  onPlacementCreated,
  onPlacementUpdated,
  onTestimonialSubmitted,
  onTestimonialReviewed,
  onBusinessScheduledCheck,
} from "@/lib/events/functions/business.functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // Sprint 1
    onLeadCreated,
    onLeadStatusChanged,
    onLeadAssigned,
    onLeadActivityCreated,
    onUserInvited,
    // Sprint 2
    onAdmissionCreated,
    onAdmissionStageChanged,
    onPaymentReceived,
    onDocumentUploaded,
    onDocumentReviewed,
    // Sprint 3
    onMediaUploaded,
    onMediaReplaced,
    onMediaDeleted,
    onPagePublished,
    onPageStatusChanged,
    onCoursePublished,
    onCourseStatusChanged,
    onContentVersionCreated,
    onCmsScheduledCheck,
    // Sprint 4
    onResourcePublished,
    onResourceStatusChanged,
    onJobPublished,
    onJobStatusChanged,
    onJobApplicationSubmitted,
    onJobApplicationStatusChanged,
    onPlacementCreated,
    onPlacementUpdated,
    onTestimonialSubmitted,
    onTestimonialReviewed,
    onBusinessScheduledCheck,
  ],
});
