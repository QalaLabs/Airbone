import { PageRepository, type PageSnapshot } from "@/lib/repositories/page.repository";
import { NotFoundError, ConflictError, ValidationError } from "@/lib/utils/errors";
import { CONTENT_STATUS_TRANSITIONS } from "@/lib/validations/page.schema";
import type {
  CreatePageInput,
  UpdatePageInput,
  PublishPageInput,
  PageFilters,
  CreateSectionInput,
  UpdateSectionInput,
  CreatePageBlockInput,
  UpdatePageBlockInput,
  ReorderLayoutInput,
} from "@/lib/validations/page.schema";
import type { ContentStatus } from "@prisma/client";
import type { RequestContext } from "@/types";
import { prisma } from "@/lib/db/client";

// ─── Optional Hooks (audit, activity feed, events) ──────────────────────────
export interface PageLifecycleHooks {
  onAudit?: (entry: Record<string, unknown>) => Promise<void> | void;
  onActivity?: (entry: Record<string, unknown>) => Promise<void> | void;
  onEvent?: (event: Record<string, unknown>) => Promise<void> | void;
}

let lifecycleHooks: PageLifecycleHooks = {
  onAudit: async (entry) => {
    if (process.env.NODE_ENV === "development") {
      console.log("[Audit]", entry.action, entry.entityId);
    }
  },
  onActivity: async () => {},
  onEvent: async () => {},
};

export function setPageLifecycleHooks(hooks: PageLifecycleHooks) {
  lifecycleHooks = { ...lifecycleHooks, ...hooks };
}

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s]+/g, "-");
}

async function ensureUniqueSlug(orgId: string, base: string, excludeId?: string): Promise<string> {
  let slug = base;
  let n = 1;
  for (;;) {
    const existing = await prisma.page.findFirst({ where: { orgId, slug }, select: { id: true } });
    if (!existing || existing.id === excludeId) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

export class PageService {
  static async list(ctx: RequestContext, filters: PageFilters) {
    return PageRepository.findMany(ctx.orgId, filters);
  }

  static async getById(ctx: RequestContext, id: string) {
    const page = await PageRepository.findById(ctx.orgId, id);
    if (!page) throw new NotFoundError("Page", id);
    return page;
  }

  static async create(ctx: RequestContext, input: CreatePageInput) {
    const baseSlug = input.slug ?? generateSlug(input.title);
    const slug = await ensureUniqueSlug(ctx.orgId, baseSlug);

    const page = await PageRepository.create(ctx.orgId, ctx.user.id, input, slug);

    await lifecycleHooks.onAudit?.({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "page.created",
      entityType: "page",
      entityId: page.id,
      newValue: { title: page.title, slug: page.slug },
    });

    await lifecycleHooks.onActivity?.({
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      verb: "created",
      objectType: "page",
      objectId: page.id,
      objectSnapshot: { title: page.title, slug: page.slug },
      context: { actorName: ctx.user.name },
    });

    return page;
  }

  static async update(ctx: RequestContext, id: string, input: UpdatePageInput) {
    const existing = await this.getById(ctx, id);

    if (input.slug && input.slug !== existing.slug) {
      const conflict = await prisma.page.findFirst({
        where: { orgId: ctx.orgId, slug: input.slug },
        select: { id: true },
      });
      if (conflict && conflict.id !== id) {
        throw new ConflictError(`Slug "${input.slug}" is already used by another page.`);
      }
    }

    const updated = await PageRepository.update(ctx.orgId, id, input);

    await lifecycleHooks.onAudit?.({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "page.updated",
      entityType: "page",
      entityId: id,
      oldValue: { title: existing.title, slug: existing.slug },
      newValue: { title: input.title ?? existing.title, slug: input.slug ?? existing.slug },
    });

    return updated;
  }

  static async publish(ctx: RequestContext, id: string, input: PublishPageInput) {
    const existing = await this.getById(ctx, id);
    const fromStatus = existing.status as ContentStatus;
    const toStatus = input.status as ContentStatus;

    const allowed = CONTENT_STATUS_TRANSITIONS[fromStatus] ?? [];
    if (!allowed.includes(toStatus)) {
      throw new ValidationError([
        { message: `Cannot transition from ${fromStatus} to ${toStatus}. Allowed: ${allowed.join(", ")}` },
      ]);
    }

    // Synchronize draft sections to relational tables upon publish
    const studioDraft = (existing.metadata as Record<string, any>)?.studioDraft;
    if (toStatus === "PUBLISHED" && studioDraft?.sections && Array.isArray(studioDraft.sections)) {
      const draftSnapshot: PageSnapshot = {
        title: existing.title,
        slug: existing.slug,
        seo: {
          title: existing.seoTitle ?? undefined,
          desc: existing.seoDesc ?? undefined,
          keywords: existing.seoKeywords,
        },
        sections: studioDraft.sections.map((s: any, sIdx: number) => ({
          name: s.name ?? `Section ${sIdx + 1}`,
          order: s.order ?? sIdx,
          isVisible: s.isVisible !== false,
          settings: s.settings ?? {},
          blocks: (s.blocks ?? []).map((b: any, bIdx: number) => ({
            blockType: b.blockType?.type || b.blockTypeId || b.type || "text",
            order: b.order ?? bIdx,
            props: b.props ?? {},
            isVisible: b.isVisible !== false,
          })),
        })),
      };
      await PageRepository.applySnapshot(ctx.orgId, id, draftSnapshot);
    }

    const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;
    const page = await PageRepository.updateStatus(ctx.orgId, id, toStatus, ctx.user.id, scheduledAt);

    // Snapshot on publish
    let versionRecord = null;
    if (toStatus === "PUBLISHED") {
      const snapshot = buildSnapshot(page);
      versionRecord = await PageRepository.createVersion(
        ctx.orgId,
        id,
        page.version,
        page.title,
        snapshot,
        toStatus,
        page.publishedAt ?? new Date(),
        ctx.user.id,
        input.notes,
      );

      await lifecycleHooks.onEvent?.({
        name: "page/published",
        orgId: ctx.orgId,
        actorId: ctx.user.id,
        actorName: ctx.user.name,
        requestId: ctx.requestId,
        timestamp: new Date().toISOString(),
        data: { pageId: id, slug: page.slug, version: page.version, versionId: versionRecord.id },
      });
    }

    await lifecycleHooks.onAudit?.({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: `page.${toStatus.toLowerCase()}`,
      entityType: "page",
      entityId: id,
      oldValue: { status: fromStatus },
      newValue: { status: toStatus, scheduledAt: scheduledAt?.toISOString() },
    });

    await lifecycleHooks.onActivity?.({
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      verb: toStatus === "PUBLISHED" ? "published" : toStatus.toLowerCase(),
      objectType: "page",
      objectId: id,
      objectSnapshot: { title: page.title, slug: page.slug, status: toStatus },
      context: { actorName: ctx.user.name },
    });

    return { page, version: versionRecord };
  }

  // ─── Layout ─────────────────────────────────────────────────────────────────

  static async reorderLayout(ctx: RequestContext, id: string, input: ReorderLayoutInput) {
    await this.getById(ctx, id);
    await PageRepository.reorderLayout(ctx.orgId, input);

    await lifecycleHooks.onAudit?.({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "page.layout_reordered",
      entityType: "page",
      entityId: id,
    });
  }

  // ─── Sections ───────────────────────────────────────────────────────────────

  static async addSection(ctx: RequestContext, pageId: string, input: CreateSectionInput) {
    await this.getById(ctx, pageId);
    const section = await PageRepository.addSection(ctx.orgId, pageId, input);

    await lifecycleHooks.onAudit?.({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "page.section_added",
      entityType: "page",
      entityId: pageId,
      newValue: { sectionId: section.id, name: section.name },
    });

    return section;
  }

  static async updateSection(
    ctx: RequestContext,
    pageId: string,
    sectionId: string,
    input: UpdateSectionInput,
  ) {
    await this.getById(ctx, pageId);
    const section = await PageRepository.updateSection(ctx.orgId, sectionId, input);

    await lifecycleHooks.onAudit?.({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "page.section_updated",
      entityType: "page",
      entityId: pageId,
      newValue: { sectionId },
    });

    return section;
  }

  static async deleteSection(ctx: RequestContext, pageId: string, sectionId: string) {
    await this.getById(ctx, pageId);
    await PageRepository.deleteSection(ctx.orgId, sectionId);

    await lifecycleHooks.onAudit?.({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "page.section_removed",
      entityType: "page",
      entityId: pageId,
      oldValue: { sectionId },
    });
  }

  // ─── Blocks ──────────────────────────────────────────────────────────────────

  static async addBlock(
    ctx: RequestContext,
    pageId: string,
    sectionId: string,
    input: CreatePageBlockInput,
  ) {
    await this.getById(ctx, pageId);

    const blockType = await prisma.contentBlock.findFirst({
      where: { id: input.blockTypeId, orgId: ctx.orgId },
      select: { schema: true },
    });
    if (!blockType) throw new NotFoundError("ContentBlock", input.blockTypeId);

    const schema = blockType.schema as { required?: string[] } | null;
    if (schema?.required?.length) {
      const props = (input.props ?? {}) as Record<string, unknown>;
      const missing = schema.required.filter((k) => !(k in props) || props[k] === undefined);
      if (missing.length > 0) {
        throw new ValidationError([
          { message: `Block props missing required fields: ${missing.join(", ")}` },
        ]);
      }
    }

    const block = await PageRepository.addBlock(ctx.orgId, sectionId, input);

    await lifecycleHooks.onAudit?.({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "page.block_added",
      entityType: "page",
      entityId: pageId,
      newValue: { blockId: block.id, blockTypeId: input.blockTypeId, sectionId },
    });

    return block;
  }

  static async updateBlock(
    ctx: RequestContext,
    pageId: string,
    _sectionId: string,
    blockId: string,
    input: UpdatePageBlockInput,
  ) {
    await this.getById(ctx, pageId);
    const block = await PageRepository.updateBlock(ctx.orgId, blockId, input);

    await lifecycleHooks.onAudit?.({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "page.block_updated",
      entityType: "page",
      entityId: pageId,
      newValue: { blockId },
    });

    return block;
  }

  static async deleteBlock(
    ctx: RequestContext,
    pageId: string,
    _sectionId: string,
    blockId: string,
  ) {
    await this.getById(ctx, pageId);
    await PageRepository.deleteBlock(ctx.orgId, blockId);

    await lifecycleHooks.onAudit?.({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "page.block_removed",
      entityType: "page",
      entityId: pageId,
      oldValue: { blockId },
    });
  }

  // ─── Versions ────────────────────────────────────────────────────────────────

  static async listVersions(ctx: RequestContext, pageId: string) {
    await this.getById(ctx, pageId);
    return PageRepository.listVersions(ctx.orgId, pageId);
  }

  static async rollback(ctx: RequestContext, pageId: string, versionId: string) {
    const page = await this.getById(ctx, pageId);
    const versionRow = await PageRepository.findVersion(ctx.orgId, pageId, versionId);
    if (!versionRow) throw new NotFoundError("PageVersion", versionId);

    const snapshot = versionRow.snapshot as unknown as PageSnapshot;
    await PageRepository.applySnapshot(ctx.orgId, pageId, snapshot);

    const newVersion = page.version + 1;
    await PageRepository.setVersionStatus(ctx.orgId, pageId, newVersion, "DRAFT");

    const newVersionRecord = await PageRepository.createVersion(
      ctx.orgId,
      pageId,
      newVersion,
      page.title,
      snapshot,
      "DRAFT",
      null,
      ctx.user.id,
      `Rolled back to v${versionRow.version}`,
    );

    await lifecycleHooks.onAudit?.({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "page.rolled_back",
      entityType: "page",
      entityId: pageId,
      oldValue: { version: page.version },
      newValue: { version: newVersion, rolledBackTo: versionRow.version },
    });

    return await PageRepository.findById(ctx.orgId, pageId);
  }
}

// ─── Snapshot builder ─────────────────────────────────────────────────────────

type FullPage = NonNullable<Awaited<ReturnType<typeof PageRepository.findById>>>;

function buildSnapshot(page: FullPage): PageSnapshot {
  return {
    title: page.title,
    slug: page.slug,
    seo: { title: page.seoTitle ?? undefined, desc: page.seoDesc ?? undefined, keywords: page.seoKeywords },
    sections: page.sections.map((s) => ({
      name: s.name ?? undefined,
      order: s.order,
      isVisible: s.isVisible,
      settings: s.settings as Record<string, unknown>,
      blocks: s.blocks.map((b) => ({
        blockType: b.blockType.type,
        order: b.order,
        props: b.props as Record<string, unknown>,
        isVisible: b.isVisible,
      })),
    })),
  };
}
