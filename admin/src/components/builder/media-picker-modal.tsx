"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ImageIcon,
  Search,
  Check,
  Loader2,
  AlertCircle,
  Upload,
  Link as LinkIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

interface MediaAsset {
  id: string;
  name: string;
  originalName?: string;
  mimeType: string;
  sizeBytes?: number;
  fileUrl: string;
  usageCount?: number;
}

interface MediaPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: string;
  onSelect: (url: string, asset?: MediaAsset) => void;
  title?: string;
  allowedTypes?: "image" | "video" | "all";
}

export function MediaPickerModal({
  open,
  onOpenChange,
  value,
  onSelect,
  title = "Select Media Asset",
  allowedTypes = "all",
}: MediaPickerModalProps) {
  const [tab, setTab] = React.useState<"library" | "upload" | "url">("library");
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [customUrl, setCustomUrl] = React.useState(value || "");
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  React.useEffect(() => {
    if (value) setCustomUrl(value);
  }, [value]);

  const { data: assets, isLoading, isError, refetch } = useQuery({
    queryKey: ["builder-media-library", debouncedSearch],
    queryFn: () => {
      const p = new URLSearchParams({
        page: "1",
        limit: "50",
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      return apiFetch<MediaAsset[]>(`/media?${p}`);
    },
    enabled: open,
  });

  const filteredAssets = React.useMemo(() => {
    if (!assets) return [];
    if (allowedTypes === "image") {
      return assets.filter((a) => a.mimeType.startsWith("image/"));
    }
    if (allowedTypes === "video") {
      return assets.filter((a) => a.mimeType.startsWith("video/"));
    }
    return assets;
  }, [assets, allowedTypes]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);

      const res = await fetch("/api/v1/media", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error?.message || `Upload failed with HTTP ${res.status}`);
      }

      const created = await res.json();
      refetch();
      if (created?.data?.fileUrl) {
        onSelect(created.data.fileUrl, created.data);
        onOpenChange(false);
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrl.trim()) {
      onSelect(customUrl.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl glass-panel border-white/10 bg-slate-900/95 text-white p-6 shadow-2xl">
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-white/10">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            {title}
          </DialogTitle>
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
            <Button
              type="button"
              variant={tab === "library" ? "default" : "ghost"}
              size="sm"
              className="h-7 text-xs font-semibold px-2.5"
              onClick={() => setTab("library")}
            >
              Media Library
            </Button>
            <Button
              type="button"
              variant={tab === "upload" ? "default" : "ghost"}
              size="sm"
              className="h-7 text-xs font-semibold px-2.5"
              onClick={() => setTab("upload")}
            >
              <Upload className="h-3 w-3 mr-1" />
              Upload
            </Button>
            <Button
              type="button"
              variant={tab === "url" ? "default" : "ghost"}
              size="sm"
              className="h-7 text-xs font-semibold px-2.5"
              onClick={() => setTab("url")}
            >
              <LinkIcon className="h-3 w-3 mr-1" />
              Direct URL
            </Button>
          </div>
        </DialogHeader>

        {tab === "library" && (
          <div className="space-y-4 pt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search assets by name or tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-secondary/40 border-white/10 text-xs text-white"
              />
            </div>

            <div className="max-h-[50vh] overflow-y-auto pr-1">
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">Loading assets...</p>
                </div>
              )}

              {isError && (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                  <AlertCircle className="h-8 w-8 text-rose-400" />
                  <p className="text-xs text-muted-foreground">Failed to load media.</p>
                  <Button variant="outline" size="sm" onClick={() => refetch()} className="border-white/10 text-xs">
                    Retry
                  </Button>
                </div>
              )}

              {!isLoading && !isError && filteredAssets.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-sm font-bold text-white">No assets found</p>
                  <p className="text-xs text-muted-foreground mt-1">Upload a file or use a direct URL.</p>
                </div>
              )}

              {!isLoading && !isError && filteredAssets.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {filteredAssets.map((asset) => {
                    const isSelected = asset.fileUrl === value;
                    return (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => {
                          onSelect(asset.fileUrl, asset);
                          onOpenChange(false);
                        }}
                        className={cn(
                          "group relative overflow-hidden rounded-xl border text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary/20 ring-2 ring-primary"
                            : "border-white/10 bg-secondary/30 hover:border-white/30 hover:bg-secondary/50",
                        )}
                      >
                        <div className="flex aspect-video w-full items-center justify-center bg-slate-950/80 overflow-hidden">
                          {asset.mimeType.startsWith("image/") ? (
                            <img
                              src={asset.fileUrl}
                              alt={asset.name}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-muted-foreground">
                              <ImageIcon className="h-6 w-6" />
                              <span className="text-[10px] uppercase">{asset.mimeType.split("/")[1] || "file"}</span>
                            </div>
                          )}
                          {isSelected && (
                            <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                              <Check className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="truncate text-xs font-semibold text-white">{asset.name}</p>
                          <Badge variant="outline" className="mt-0.5 text-[9px] text-muted-foreground border-white/10">
                            {asset.usageCount ?? 0} uses
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "upload" && (
          <div className="py-8 space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl p-8 hover:border-primary/50 transition-colors bg-secondary/20">
              <Upload className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-bold text-white">Upload New Asset</p>
              <p className="text-xs text-muted-foreground mt-1 text-center max-w-sm">
                PNG, JPG, WebP, SVG or MP4 files will be uploaded directly to the media store.
              </p>
              <label className="mt-4 inline-flex items-center gap-2 cursor-pointer bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                <Upload className="h-3.5 w-3.5" />
                Choose File
                <input
                  type="file"
                  className="hidden"
                  accept={allowedTypes === "image" ? "image/*" : allowedTypes === "video" ? "video/*" : "image/*,video/*"}
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            {uploading && (
              <div className="flex items-center justify-center gap-2 text-xs text-primary font-semibold">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading asset to media storage...
              </div>
            )}
            {uploadError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400">
                {uploadError}
              </div>
            )}
          </div>
        )}

        {tab === "url" && (
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white">Direct Image or Video URL</label>
              <Input
                placeholder="https://example.com/image.jpg or /images/..."
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="bg-secondary/40 border-white/10 text-xs text-white"
              />
              <p className="text-[11px] text-muted-foreground">
                Enter an absolute HTTPS URL or an existing local path in /images/ or /assets/.
              </p>
            </div>
            {customUrl && (
              <div className="rounded-lg border border-white/10 p-2 bg-slate-950/60 max-w-xs">
                <p className="text-[10px] text-muted-foreground mb-1">Preview:</p>
                <img
                  src={customUrl}
                  alt="Preview"
                  className="h-28 w-full object-cover rounded"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            )}
            <DialogFooter className="pt-4 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="border-white/10 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleApplyCustomUrl}
                disabled={!customUrl.trim()}
                className="text-xs font-bold"
              >
                Apply URL
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
