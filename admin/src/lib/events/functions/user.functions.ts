import { inngest } from "@/lib/events/inngest";
import { AuditService } from "@/lib/services/audit.service";
import { ActivityFeedService } from "@/lib/services/activity.service";
import { NotificationService } from "@/lib/services/notification.service";

// The emitEvent() wrapper flattens all BaseEvent fields + data fields into event.data
type UserInvitedData = {
  orgId: string;
  actorId: string;
  actorName: string;
  requestId: string;
  userId: string;
  email: string;
  role: string;
  inviteToken: string;
};

export const onUserInvited = inngest.createFunction(
  { id: "user-invited", name: "On user invited" },
  { event: "user/invited" },
  async ({ event, step }) => {
    const d = event.data as UserInvitedData;

    await step.run("write-audit", async () => {
      await AuditService.write({
        orgId: d.orgId,
        userId: d.actorId,
        requestId: d.requestId,
        action: "user.invited",
        entityType: "user",
        entityId: d.userId,
        newValue: { email: d.email, role: d.role },
      });
    });

    await step.run("write-activity-feed", async () => {
      await ActivityFeedService.write({
        orgId: d.orgId,
        actorId: d.actorId,
        verb: "invited",
        objectType: "user",
        objectId: d.userId,
        objectSnapshot: { email: d.email, role: d.role },
        context: { actorName: d.actorName },
      });
    });

    // Send invitation email (fires only when an active USER_INVITED/EMAIL template exists)
    await step.run("send-invite-email", async () => {
      await NotificationService.dispatch({
        orgId: d.orgId,
        event: "USER_INVITED",
        channel: "EMAIL",
        recipient: d.email,
        variables: { email: d.email, role: d.role, inviteToken: d.inviteToken },
        entityType: "user",
        entityId: d.userId,
      });
    });

    return { ok: true };
  },
);
