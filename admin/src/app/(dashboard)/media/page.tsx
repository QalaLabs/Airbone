"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Folder,
  FolderOpen,
  Image,
  FileText,
  Film,
  File,
  Music,
  MoreHorizontal,
  ChevronRight,
  Home,
  Grid3X3,
  List,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface MediaAsset {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  folderId?: string;
  folder?: { name: string };
  width?: number;
  height?: number;
  createdAt: string;
}

interface MediaFolder {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  assetCount?: number;
}

interface MediaResponse {
  items: MediaAsset[];
  total: number;
  totalPages: number;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return Image;
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
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedFolder, setSelectedFolder] = React.useState<string | null>(null);
  const [folderPath, setFolderPath] = React.useState<{ id: string; name: string }[]>([]);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [selectedAsset, setSelectedAsset] = React.useState<MediaAsset | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data: folders } = useQuery({
    queryKey: ["media-folders", selectedFolder],
    queryFn: () => apiFetch<{ items: MediaFolder[] }>(`/media/folders${selectedFolder ? `?parentId=${selectedFolder}` : ""}`),
  });

  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ["media", selectedFolder, debouncedSearch],
    queryFn: () => {
      const p = new URLSearchParams({
        page: "1",
        limit: "60",
        ...(selectedFolder ? { folderId: selectedFolder } : {}),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      return apiFetch<MediaResponse>(`/media?${p}`);
    },
  });

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

  const currentFolders = folders?.items ?? [];
  const mediaAssets = assets?.items ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Media"
        description={`${assets?.total ?? 0} assets`}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", viewMode === "grid" && "bg-accent")}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", viewMode === "list" && "bg-accent")}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm">
        <button
          onClick={navigateToRoot}
          className={cn(
            "flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors",
            folderPath.length === 0 && "text-foreground font-medium",
          )}
        >
          <Home className="h-3.5 w-3.5" />
          Media
        </button>
        {folderPath.map((item, i) => (
          <React.Fragment key={item.id}>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <button
              onClick={() => navigateUp(i)}
              className={cn(
                "text-muted-foreground hover:text-foreground transition-colors",
                i === folderPath.length - 1 && "text-foreground font-medium",
              )}
            >
              {item.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search media..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Folders */}
      {currentFolders.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Folders</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {currentFolders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => navigateToFolder(folder)}
                className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 hover:bg-accent hover:border-primary/30 transition-all group"
              >
                <FolderOpen className="h-8 w-8 text-warning group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-foreground truncate w-full text-center">
                  {folder.name}
                </span>
                {folder.assetCount != null && (
                  <Badge variant="muted" className="text-[10px] px-1.5 py-0">
                    {folder.assetCount}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Assets */}
      <div>
        {currentFolders.length > 0 && (
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Files</p>
        )}

        {assetsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : mediaAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <File className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No media files found</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {mediaAssets.map((asset) => {
              const Icon = getFileIcon(asset.mimeType);
              const isImage = asset.mimeType.startsWith("image/");
              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className="group relative rounded-lg border border-border bg-card overflow-hidden cursor-pointer hover:border-primary/50 transition-all"
                >
                  <div className="aspect-square flex items-center justify-center bg-muted/30">
                    {isImage && asset.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={asset.thumbnailUrl || asset.url}
                        alt={asset.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Icon className="h-10 w-10 text-muted-foreground/60" />
                    )}
                  </div>
                  <div className="p-2 border-t border-border">
                    <p className="text-xs font-medium text-foreground truncate">{asset.name}</p>
                    <p className="text-[10px] text-muted-foreground">{formatFileSize(asset.size)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Size</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Uploaded</th>
                  <th className="w-10 px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {mediaAssets.map((asset) => {
                  const Icon = getFileIcon(asset.mimeType);
                  return (
                    <tr key={asset.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium text-foreground">{asset.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{asset.mimeType}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatFileSize(asset.size)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(asset.createdAt)}</td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <a href={asset.url} target="_blank" rel="noreferrer">Open</a>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => navigator.clipboard.writeText(asset.url)}>
                              Copy URL
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Asset Preview Dialog */}
      {selectedAsset && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedAsset(null)}
        >
          <div
            className="bg-card rounded-lg border border-border p-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{selectedAsset.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedAsset.mimeType} · {formatFileSize(selectedAsset.size)}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedAsset(null)}>
                <span className="text-lg">×</span>
              </Button>
            </div>
            {selectedAsset.mimeType.startsWith("image/") && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedAsset.url} alt={selectedAsset.name} className="w-full rounded-md object-contain max-h-96" />
            )}
            <div className="mt-4 flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={selectedAsset.url} target="_blank" rel="noreferrer">Open in new tab</a>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(selectedAsset.url)}>
                Copy URL
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
