import { z } from "zod";

// ─── Media Asset ─────────────────────────────────────────────────────────────

export const registerAssetSchema = z.object({
  name: z.string().min(1).max(255),
  originalName: z.string().min(1).max(255),
  fileKey: z.string().min(1).max(500),
  fileUrl: z.string().url(),
  mimeType: z.string().min(1).max(100),
  sizeBytes: z.number().int().positive(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  duration: z.number().int().positive().optional(),
  altText: z.string().max(500).optional(),
  caption: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  folderId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional().default({}),
});
export type RegisterAssetInput = z.infer<typeof registerAssetSchema>;

export const updateAssetSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  altText: z.string().max(500).nullable().optional(),
  caption: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  folderId: z.string().uuid().nullable().optional(),
});
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;

export const replaceAssetSchema = z.object({
  fileKey: z.string().min(1).max(500),
  fileUrl: z.string().url(),
  mimeType: z.string().min(1).max(100),
  sizeBytes: z.number().int().positive(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  duration: z.number().int().positive().optional(),
});
export type ReplaceAssetInput = z.infer<typeof replaceAssetSchema>;

export const presignMediaSchema = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.string().min(1).max(100),
  folderId: z.string().uuid().optional(),
});
export type PresignMediaInput = z.infer<typeof presignMediaSchema>;

export const assetFiltersSchema = z.object({
  search: z.string().optional(),
  folderId: z.string().uuid().nullable().optional(),
  mimeType: z.string().optional(),
  tags: z.string().optional(), // comma-separated
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === undefined ? undefined : v !== "false")),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "name", "sizeBytes"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});
export type AssetFilters = z.infer<typeof assetFiltersSchema>;

// ─── Media Folder ─────────────────────────────────────────────────────────────

export const createFolderSchema = z.object({
  name: z.string().min(1).max(255),
  parentId: z.string().uuid().optional(),
});
export type CreateFolderInput = z.infer<typeof createFolderSchema>;

export const updateFolderSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  parentId: z.string().uuid().nullable().optional(),
});
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;
