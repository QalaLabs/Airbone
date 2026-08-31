import { WhatsAppService } from "@/lib/services/whatsapp.service";
import { guard } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { ok, handleError } from "@/lib/utils/response";

// Read view over active workflows that use WhatsApp (SEND_WHATSAPP steps or
// WHATSAPP_* triggers). Full workflow management lives in /api/v1/workflows.
export async function GET() {
  try {
    const ctx = await getRequestContext();
    guard(ctx.user, "read", "workflows");

    const automations = await WhatsAppService.listAutomations(ctx.orgId);
    return ok(automations);
  } catch (err) {
    return handleError(err);
  }
}
