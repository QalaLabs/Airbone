import { type NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { TimelineService } from "@/lib/services/timeline.service";
import { guard } from "@/lib/middleware/permissions";
import { getRequestContext } from "@/lib/middleware/context";
import { ok, handleError, buildPaginationMeta } from "@/lib/utils/response";
import { NotFoundError } from "@/lib/utils/errors";
import { timelineQuerySchema } from "@/lib/validations/timeline.schema";

type Params = { params: Promise<{ id: string }> };

// Student unified timeline = the timeline of the lead this student was created
// from (Student.leadId is unique). Collection remarks and every other lead
// activity therefore surface here without a second, disconnected write path.

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    guard(ctx.user, "read", "students");

    const student = await prisma.student.findFirst({
      where: { id, orgId: ctx.orgId, deletedAt: null },
      select: { id: true, leadId: true },
    });
    if (!student) throw new NotFoundError("Student", id);

    const url = new URL(req.url);
    const query = timelineQuerySchema.parse(Object.fromEntries(url.searchParams));

    if (!student.leadId) {
      return ok([], buildPaginationMeta(0, query.page, query.limit));
    }

    const { items, total } = await TimelineService.getTimeline(ctx.orgId, {
      ...query,
      entityType: "LEAD",
      entityId: student.leadId,
    });
    return ok(items, buildPaginationMeta(total, query.page, query.limit));
  } catch (err) {
    return handleError(err);
  }
}
