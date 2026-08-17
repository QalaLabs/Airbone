import { inngest } from "@/lib/events/inngest";
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

    // Durable audit/activity is owned synchronously by UserService.invite
    // (audit "user.invited" + activity "invited"). This handler only owns the
    // asynchronous invitation email.

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
