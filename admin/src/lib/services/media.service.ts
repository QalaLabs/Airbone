import { v4 as uuid } from "uuid";
import { MediaRepository, MediaFolderRepository } from "@/lib/repositories/media.repository";
import { AuditService } from "@/lib/services/audit.service";
import { ActivityFeedService } from "@/lib/services/activity.service";
import { emitEvent } from "@/lib/events/inngest";
import { NotFoundError, ConflictError } from "@/lib/utils/errors";
import type {
  RegisterAssetInput,
  UpdateAssetInput,
  ReplaceAssetInput,
  PresignMediaInput,
  AssetFilters,
  CreateFolderInput,
  UpdateFolderInput,
} from "@/lib/validations/media.schema";
import type { RequestContext } from "@/types";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME ?? "airborne-media";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "";

// ─── MediaService ─────────────────────────────────────────────────────────────

export class MediaService {
  static async list(ctx: RequestContext, filters: AssetFilters) {
    return MediaRepository.findMany(ctx.orgId, filters);
  }

  static async getById(ctx: RequestContext, id: string) {
    const asset = await MediaRepository.findById(ctx.orgId, id);
    if (!asset) throw new NotFoundError("MediaAsset", id);
    return asset;
  }

  static async getPresignedUrl(
    _ctx: RequestContext,
    input: PresignMediaInput,
  ): Promise<{ uploadUrl: string; fileKey: string; fileUrl: string }> {
    const ext = input.fileName.split(".").pop() ?? "bin";
    const fileKey = `media/${Date.now()}-${uuid()}.${ext}`;

    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
      return {
        uploadUrl: `http://localhost:4000/api/v1/upload-mock?key=${fileKey}`,
        fileKey,
        fileUrl: `http://localhost:4000/_mock/${fileKey}`,
      };
    }

    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

    const client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
    });

    const cmd = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: input.contentType,
    });

    const uploadUrl = await getSignedUrl(client, cmd, { expiresIn: 900 });
    const fileUrl = `${R2_PUBLIC_URL}/${fileKey}`;

    return { uploadUrl, fileKey, fileUrl };
  }

  static async register(ctx: RequestContext, input: RegisterAssetInput) {
    const asset = await MediaRepository.create(ctx.orgId, ctx.user.id, input);

    await emitEvent({
      name: "media/uploaded",
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      actorName: ctx.user.name,
      requestId: ctx.requestId,
      timestamp: new Date().toISOString(),
      data: {
        assetId: asset.id,
        name: asset.name,
        mimeType: asset.mimeType,
        folderId: asset.folderId ?? undefined,
      },
    });

    return asset;
  }

  static async update(ctx: RequestContext, id: string, input: UpdateAssetInput) {
    const existing = await MediaRepository.findById(ctx.orgId, id);
    if (!existing) throw new NotFoundError("MediaAsset", id);

    const updated = await MediaRepository.update(ctx.orgId, id, input);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "media.updated",
      entityType: "media_asset",
      entityId: id,
      oldValue: { name: existing.name, tags: existing.tags },
      newValue: { name: input.name ?? existing.name, tags: input.tags ?? existing.tags },
    });

    return updated;
  }

  static async replace(ctx: RequestContext, id: string, input: ReplaceAssetInput) {
    const existing = await MediaRepository.findById(ctx.orgId, id);
    if (!existing) throw new NotFoundError("MediaAsset", id);

    const newAssetId = uuid();
    const newAsset = await MediaRepository.replace(ctx.orgId, id, input, newAssetId);
    if (!newAsset) throw new NotFoundError("MediaAsset", id);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "media.replaced",
      entityType: "media_asset",
      entityId: id,
      oldValue: { fileKey: existing.fileKey },
      newValue: { fileKey: input.fileKey, replacedById: newAssetId },
    });

    await emitEvent({
      name: "media/replaced",
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      actorName: ctx.user.name,
      requestId: ctx.requestId,
      timestamp: new Date().toISOString(),
      data: { assetId: newAssetId, oldFileKey: existing.fileKey, newFileKey: input.fileKey },
    });

    return newAsset;
  }

  static async delete(ctx: RequestContext, id: string) {
    const existing = await MediaRepository.findById(ctx.orgId, id);
    if (!existing) throw new NotFoundError("MediaAsset", id);

    const usageCount = await MediaRepository.getUsageCount(id);
    if (usageCount > 0) {
      throw new ConflictError(
        `Cannot delete asset — it is used in ${usageCount} place(s). Remove all references first.`,
      );
    }

    await MediaRepository.softDelete(ctx.orgId, id);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "media.deleted",
      entityType: "media_asset",
      entityId: id,
      oldValue: { name: existing.name, fileKey: existing.fileKey },
    });

    await ActivityFeedService.write({
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      verb: "deleted",
      objectType: "media_asset",
      objectId: id,
      objectSnapshot: { name: existing.name },
      context: { actorName: ctx.user.name },
    });

    await emitEvent({
      name: "media/deleted",
      orgId: ctx.orgId,
      actorId: ctx.user.id,
      actorName: ctx.user.name,
      requestId: ctx.requestId,
      timestamp: new Date().toISOString(),
      data: { assetId: id, name: existing.name },
    });
  }

  static async trackUsage(
    ctx: RequestContext,
    assetId: string,
    entityType: string,
    entityId: string,
    fieldName?: string,
  ) {
    await MediaRepository.trackUsage(ctx.orgId, assetId, entityType, entityId, fieldName);
  }

  static async untrackUsage(
    _ctx: RequestContext,
    assetId: string,
    entityType: string,
    entityId: string,
    fieldName?: string,
  ) {
    await MediaRepository.untrackUsage(assetId, entityType, entityId, fieldName);
  }
}

// ─── MediaFolderService ────────────────────────────────────────────────────────

export class MediaFolderService {
  static async list(ctx: RequestContext) {
    return MediaFolderRepository.findAll(ctx.orgId);
  }

  static async getById(ctx: RequestContext, id: string) {
    const folder = await MediaFolderRepository.findById(ctx.orgId, id);
    if (!folder) throw new NotFoundError("MediaFolder", id);
    return folder;
  }

  static async create(ctx: RequestContext, input: CreateFolderInput) {
    const folder = await MediaFolderRepository.create(ctx.orgId, ctx.user.id, input);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "media_folder.created",
      entityType: "media_folder",
      entityId: folder.id,
      newValue: { name: folder.name, path: folder.path },
    });

    return folder;
  }

  static async update(ctx: RequestContext, id: string, input: UpdateFolderInput) {
    const existing = await MediaFolderRepository.findById(ctx.orgId, id);
    if (!existing) throw new NotFoundError("MediaFolder", id);

    const updated = await MediaFolderRepository.update(ctx.orgId, id, input);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "media_folder.updated",
      entityType: "media_folder",
      entityId: id,
      oldValue: { name: existing.name, path: existing.path },
      newValue: { name: updated?.name, path: updated?.path },
    });

    return updated;
  }

  static async delete(ctx: RequestContext, id: string) {
    const existing = await MediaFolderRepository.findById(ctx.orgId, id);
    if (!existing) throw new NotFoundError("MediaFolder", id);

    const hasContents = await MediaFolderRepository.hasChildren(ctx.orgId, id);
    if (hasContents) {
      throw new ConflictError("Cannot delete folder — it contains files or sub-folders. Move or delete contents first.");
    }

    await MediaFolderRepository.delete(ctx.orgId, id);

    await AuditService.write({
      orgId: ctx.orgId,
      userId: ctx.user.id,
      requestId: ctx.requestId,
      action: "media_folder.deleted",
      entityType: "media_folder",
      entityId: id,
      oldValue: { name: existing.name, path: existing.path },
    });
  }
}
