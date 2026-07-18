"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Folder, FolderOpen, Image as ImageIcon, FileText, Film, File, Music, 
  MoreHorizontal, ChevronRight, Home, Grid3X3, List, Copy, ExternalLink, 
  Upload, Server, Save, CheckCircle2, Cloud, Plus, Trash2, Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface MediaAsset {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  fileUrl: string;
  createdAt: string;
  folderId?: string;
}

interface MediaFolder {
  id: string;
  name: string;
  parentId?: string;
  _count?: { assets: number };
}

interface MediaResponse {
  items: MediaAsset[];
  total: number;
  totalPages: number;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return ImageIcon;
  if (mimeType.startsWith("video/")) return Film;
  if (mimeType.startsWith("audio/")) return Music;
  if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) return FileText;
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function MediaPage() {
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedFolder, setSelectedFolder] = React.useState<string | null>(null);
  const [folderPath, setFolderPath] = React.useState<{ id: string; name: string }[]>([]);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [selectedAsset, setSelectedAsset] = React.useState<MediaAsset | null>(null);
  const [createFolderOpen, setCreateFolderOpen] = React.useState(false);
  const [newFolderName, setNewFolderName] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Load folders
  const { data: folders } = useQuery<MediaFolder[]>({
    queryKey: ["media-folders", selectedFolder],
    queryFn: async () => {
      const res = await apiFetch<MediaFolder[]>("/media/folders");
      // Filter current level folders locally for simplicity or keep all
      return res.filter(f => selectedFolder ? f.parentId === selectedFolder : !f.parentId);
    },
  });

  // Load assets
  const { data: assets, isLoading: assetsLoading } = useQuery<MediaResponse>({
    queryKey: ["media", selectedFolder, debouncedSearch],
    queryFn: async () => {
      const p = new URLSearchParams({
        page: "1",
        limit: "60",
        ...(selectedFolder ? { folderId: selectedFolder } : {}),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      return apiFetch<MediaResponse>(`/media?${p}`);
    },
  });

  const mediaAssets = assets?.items ?? [];

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: (body: { name: string; parentId?: string }) => 
      apiFetch<MediaFolder>("/media/folders", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-folders"] });
      toast({ title: "Folder Created", description: "Directory created successfully." });
      setCreateFolderOpen(false);
      setNewFolderName("");
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  // Delete asset mutation
  const deleteAssetMutation = useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/media/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast({ title: "Asset Deleted", description: "The media asset was removed permanently." });
      setSelectedAsset(null);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFolderMutation.mutate({
      name: newFolderName,
      parentId: selectedFolder || undefined,
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      toast({ title: "Initializing Upload", description: "Requesting presigned upload token..." });

      // 1. Get presigned upload URL
      const { uploadUrl, fileKey, fileUrl } = await apiFetch<{ uploadUrl: string; fileKey: string; fileUrl: string }>(
        "/media/presign",
        {
          method: "POST",
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            folderId: selectedFolder || undefined,
          }),
        }
      );

      // 2. Perform direct PUT upload (to local upload-mock or S2/R2 bucket URL)
      toast({ title: "Transferring File", description: `Uploading ${file.name} directly to storage...` });
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadRes.ok) {
        throw new Error(`Upload transaction failed: HTTP ${uploadRes.status}`);
      }

      // 3. Register asset details in database
      toast({ title: "Registering Asset", description: "Synchronizing media record with DB..." });
      await apiFetch<MediaAsset>("/media", {
        method: "POST",
        body: JSON.stringify({
          name: file.name,
          originalName: file.name,
          fileKey,
          fileUrl,
          mimeType: file.type,
          sizeBytes: file.size,
          folderId: selectedFolder || undefined,
        }),
      });

      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast({ title: "Upload Succeeded", description: `${file.name} registered and indexed successfully.` });
    } catch (err: any) {
      console.error("[Upload Error]:", err);
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const navigateToFolder = (folder: MediaFolder) => {
    setFolderPath((prev) => [...prev, { id: folder.id, name: folder.name }]);
    setSelectedFolder(folder.id);
  };

  const navigateUp = (index: number) => {
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
    setSelectedFolder(newPath.length > 0 ? (newPath[newPath.length - 1]?.id ?? null) : null);
  };

  const navigateToRoot = () => {
    setFolderPath([]);
    setSelectedFolder(null);
  };

  const handleCopyUrl = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    toast({ title: "CDN URL Copied", description: "High-speed asset link copied to clipboard." });
  };

  return (
    <div className="space-y-8 pb-12 text-white">
      <PageHeader
        title="Media Library & CDN Storage"
        description="Unified digital asset grid of high-res academy photography and media files with direct direct-to-cloud upload."
        action={
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            <Button
              onClick={() => setCreateFolderOpen(true)}
              variant="outline"
              className="border-white/10 hover:bg-white/5 text-xs font-bold text-white"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Folder
            </Button>
            <Button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 text-xs font-bold"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1.5" />
                  Upload Media Asset
                </>
              )}
            </Button>
          </div>
        }
      />

      {/* Control Bar: Search & View Mode */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs font-bold bg-secondary/40 px-3 py-2 rounded-xl border border-white/5">
          <button
            onClick={navigateToRoot}
            className={cn(
              "flex items-center gap-1 text-muted-foreground hover:text-white transition-colors",
              folderPath.length === 0 && "text-primary font-bold",
            )}
          >
            <Home className="h-3.5 w-3.5" />
            Media Root
          </button>
          {folderPath.map((item, i) => (
            <React.Fragment key={item.id}>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              <button
                onClick={() => navigateUp(i)}
                className={cn(
                  "text-muted-foreground hover:text-white transition-colors",
                  i === folderPath.length - 1 && "text-primary font-bold",
                )}
              >
                {item.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search assets by filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary/40 border-white/10 focus:border-primary text-xs font-semibold text-white"
            />
          </div>
          <div className="flex items-center border border-white/10 rounded-xl p-1 bg-secondary/20">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-lg", viewMode === "grid" && "bg-primary text-white shadow-md")}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-lg", viewMode === "list" && "bg-primary text-white shadow-md")}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Folders */}
      {folders && folders.length > 0 && (
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">Directory Folders</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => navigateToFolder(folder)}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-secondary/20 p-5 hover:bg-secondary/40 hover:border-white/20 transition-all group shadow-xl"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                    <FolderOpen className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{folder.name}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Assets Grid */}
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">Digital Media Assets</p>

        {assetsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-video rounded-2xl" />
            ))}
          </div>
        ) : mediaAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-2xl border border-white/10">
            <File className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-bold text-white">No media files found in this directory</p>
            <p className="text-xs text-muted-foreground mt-1">Upload high-res photos or videos to start managing CDN assets.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mediaAssets.map((asset) => {
              const Icon = getFileIcon(asset.mimeType);
              const isImage = asset.mimeType.startsWith("image/");
              const isVideo = asset.mimeType.startsWith("video/");
              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className="group relative rounded-2xl border border-white/10 bg-slate-900 overflow-hidden cursor-pointer hover:border-white/20 transition-all shadow-2xl flex flex-col"
                >
                  <div className="aspect-video w-full flex items-center justify-center bg-slate-950 relative overflow-hidden">
                    {isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={asset.fileUrl}
                        alt={asset.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Icon className="h-10 w-10 text-muted-foreground/60" />
                    )}
                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30">
                          <Film className="h-5 w-5 ml-0.5" />
                        </div>
                      </div>
                    )}
                    <span className="absolute top-3 left-3 text-[10px] font-extrabold bg-slate-900/80 backdrop-blur-md text-white border border-white/10 px-2.5 py-1 rounded-full">
                      {asset.mimeType.split("/")[1]?.toUpperCase() || "FILE"}
                    </span>
                    <button
                      onClick={(e) => handleCopyUrl(asset.fileUrl, e)}
                      className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-white/10 hover:bg-primary hover:text-white transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                      title="Copy CDN URL"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="p-4 border-t border-white/10 bg-slate-900/90 flex flex-col justify-between flex-1">
                    <p className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">{asset.name}</p>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2 pt-2 border-t border-white/5 font-medium">
                      <span>{formatFileSize(asset.sizeBytes)}</span>
                      <span>{formatDate(asset.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 overflow-hidden glass-panel shadow-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-slate-900/80">
                  <th className="text-left px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Asset Name</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">MIME Type</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Storage Size</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Upload Timestamp</th>
                  <th className="w-24 px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-secondary/20">
                {mediaAssets.map((asset) => {
                  const Icon = getFileIcon(asset.mimeType);
                  return (
                    <tr key={asset.id} onClick={() => setSelectedAsset(asset)} className="hover:bg-white/5 transition-colors cursor-pointer group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 border border-white/10 text-primary shrink-0">
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="font-bold text-white group-hover:text-primary transition-colors text-xs">{asset.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground font-mono">{asset.mimeType}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground font-semibold">{formatFileSize(asset.sizeBytes)}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">{formatDate(asset.createdAt)}</td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={(e) => handleCopyUrl(asset.fileUrl, e)} className="text-xs font-bold text-primary hover:bg-white/10">
                          <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy URL
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
        <DialogContent className="max-w-md glass-panel border-white/10 bg-slate-900/95 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Folder className="h-5 w-5 text-amber-400" /> Create Directory Folder
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFolderSubmit} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Folder Name *</label>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                required
                className="bg-secondary/40 border-white/10 text-xs text-white"
              />
            </div>
            <DialogFooter className="pt-4 border-t border-white/10">
              <Button type="button" variant="outline" onClick={() => setCreateFolderOpen(false)} className="border-white/10 hover:bg-white/5 text-xs font-bold">Cancel</Button>
              <Button type="submit" disabled={createFolderMutation.isPending} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold">
                {createFolderMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Create Folder"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Asset Preview Dialog */}
      <Dialog open={!!selectedAsset} onOpenChange={(o) => !o && setSelectedAsset(null)}>
        <DialogContent className="max-w-4xl glass-panel border-white/10 bg-slate-900/95 p-0 overflow-hidden text-white">
          <DialogHeader className="p-6 border-b border-white/10 bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-white truncate">{selectedAsset?.name}</DialogTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  MIME: <span className="font-mono text-primary font-bold">{selectedAsset?.mimeType}</span> • File Size: <span className="text-white font-semibold">{selectedAsset ? formatFileSize(selectedAsset.sizeBytes) : "0 B"}</span>
                </p>
              </div>
              <Button size="sm" onClick={(e) => selectedAsset && handleCopyUrl(selectedAsset.fileUrl, e)} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold">
                <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy CDN URL
              </Button>
            </div>
          </DialogHeader>

          {selectedAsset && (
            <div className="p-6 flex flex-col items-center justify-center bg-slate-950 min-h-[360px]">
              {selectedAsset.mimeType.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedAsset.fileUrl} alt={selectedAsset.name} className="w-full rounded-xl object-contain max-h-[500px] border border-white/10 shadow-2xl" />
              ) : selectedAsset.mimeType.startsWith("video/") ? (
                <video src={selectedAsset.fileUrl} controls className="w-full rounded-xl max-h-[500px] border border-white/10 shadow-2xl" />
              ) : (
                <div className="text-center py-16">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm font-bold text-white">No rich preview available for this document type</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="p-6 border-t border-white/10 bg-slate-900/80">
            <Button variant="outline" onClick={() => setSelectedAsset(null)} className="border-white/10 hover:bg-white/5 text-xs font-bold">
              Close Preview
            </Button>
            <Button size="sm" onClick={() => { if(confirm("Are you sure you want to delete this asset?")) deleteAssetMutation.mutate(selectedAsset!.id); }} disabled={deleteAssetMutation.isPending} className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold">
              {deleteAssetMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Asset</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
