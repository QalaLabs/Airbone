"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef, type PaginationState, type SortingState } from "@tanstack/react-table";
import { Search, MoreHorizontal, ExternalLink, Plus, Globe, Archive, Trash2, Pencil, AlertCircle, Upload, Bold, Italic, List, ListOrdered, Link2, Heading2, Heading3, Quote, Table, Image, Code, Eye } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { MediaPicker } from "@/components/shared/media-picker";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

interface Resource {
  id: string;
  title: string;
  slug: string;
  description?: string;
  type: string;
  status: string;
  fileUrl?: string;
  externalUrl?: string;
  thumbnailId?: string;
  category?: string;
  isGated?: boolean;
  tags?: string[];
  seoTitle?: string;
  seoDesc?: string;
  /** CMS-03: article HTML lives in metadata.bodyHtml (no length cap). */
  metadata?: Record<string, unknown>;
  downloadCount?: number;
  publishedAt?: string;
  createdAt: string;
}

interface ResourcesResponse {
  data: Resource[];
  total: number;
}

const MAX_UPLOAD_BYTES = 30 * 1024 * 1024;

export const RESOURCE_TYPES = ["PDF", "VIDEO", "LINK", "IMAGE", "DOCUMENT", "AUDIO", "OTHER"];

export const RESOURCE_TYPE_LABELS: Record<string, string> = {
  PDF: "PDF",
  VIDEO: "Video",
  LINK: "Link",
  IMAGE: "Image",
  DOCUMENT: "Document / Article",
  AUDIO: "Audio",
  OTHER: "Other",
};

interface ResourceManagerProps {
  title: string;
  description: string;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Default type filter applied to the list. "all" shows every resource. */
  defaultType?: string;
  /** Hide the type column + type filter (used by the blog module). */
  hideType?: boolean;
}

export function ResourceManager({
  title,
  description,
  emptyTitle = "No resources found",
  emptyDescription = "Create your first resource to get started.",
  defaultType = "all",
  hideType = false,
}: ResourceManagerProps) {
  const queryClient = useQueryClient();
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState(defaultType);
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [editor, setEditor] = React.useState<{ open: boolean; item: Resource | null }>({ open: false, item: null });
  const [deleteTarget, setDeleteTarget] = React.useState<Resource | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [thumbnailId, setThumbnailId] = React.useState<string | null>(null);
  const [bodyHtml, setBodyHtml] = React.useState<string>("");
  const [bodyMode, setBodyMode] = React.useState<"visual" | "source">("visual");
  const [seoTitle, setSeoTitle] = React.useState<string>("");
  const [seoDesc, setSeoDesc] = React.useState<string>("");
  const [author, setAuthor] = React.useState<string>("Capt. Navrang Singh");
  const [customAuthor, setCustomAuthor] = React.useState<string>("");
  const [featuredImageAlt, setFeaturedImageAlt] = React.useState<string>("");
  const fileUrlRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const bodyEditorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (editor.open) {
      const meta = (editor.item?.metadata ?? {}) as Record<string, unknown>;
      const initHtml = String(meta.bodyHtml ?? "");
      setBodyHtml(initHtml);
      setBodyMode("visual");
      setThumbnailId(editor.item?.thumbnailId ?? null);
      setSeoTitle(editor.item?.seoTitle ?? "");
      setSeoDesc(editor.item?.seoDesc ?? "");
      const currentAuthor = String(meta.author ?? "Capt. Navrang Singh");
      if (["Capt. Navrang Singh", "Deepak Aggarwal", "Airborne Editorial Team"].includes(currentAuthor)) {
        setAuthor(currentAuthor);
        setCustomAuthor("");
      } else {
        setAuthor("Custom");
        setCustomAuthor(currentAuthor);
      }
      setFeaturedImageAlt(String(meta.featuredImageAlt ?? ""));
      setTimeout(() => {
        if (bodyEditorRef.current) {
          bodyEditorRef.current.innerHTML = initHtml;
        }
      }, 0);
    }
  }, [editor.open, editor.item?.id]);

  // CMS rich-text commands for the article body
  const execEditor = (command: string, value?: string) => {
    bodyEditorRef.current?.focus();
    document.execCommand(command, false, value);
    if (bodyEditorRef.current) setBodyHtml(bodyEditorRef.current.innerHTML);
  };

  const insertTable = () => {
    const tableMarkup = `<table><thead><tr><th>Topic</th><th>Details</th></tr></thead><tbody><tr><td>Eligibility</td><td>10+2 with Physics &amp; Mathematics</td></tr><tr><td>DGCA Medical</td><td>Class 2 followed by Class 1</td></tr></tbody></table><p></p>`;
    execEditor("insertHTML", tableMarkup);
  };

  const insertImage = () => {
    const url = window.prompt("Image URL (https://...)");
    if (!url || !/^https?:\/\//i.test(url)) return;
    const alt = window.prompt("Image Alt text / description") || "";
    const imgMarkup = `<figure><img src="${encodeURI(url)}" alt="${alt.replace(/"/g, '&quot;')}" /><figcaption>${alt.replace(/</g, '&lt;')}</figcaption></figure><p></p>`;
    execEditor("insertHTML", imgMarkup);
  };

  const insertLink = () => {
    const url = window.prompt("Link URL (e.g. /courses or https://...)");
    if (url && (url.startsWith("/") || url.startsWith("#") || /^https?:\/\//i.test(url))) {
      execEditor("createLink", url);
    }
  };

  const uploadFile = async (file: File) => {
    // Cloud Run rejects request bodies above 32 MB, below the 50 MB storage limit.
    if (file.size > MAX_UPLOAD_BYTES) {
      toast({ title: "File too large", description: "Upload files up to 30 MB, or paste a link instead.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("tags", "resource");
      const asset = await apiFetch<{ fileUrl: string }>("/media", { method: "POST", body: form });
      if (fileUrlRef.current) fileUrlRef.current.value = asset.fileUrl;
      toast({ title: "File uploaded", description: file.name });
    } catch (err) {
      toast({ title: "Upload failed", description: err instanceof Error ? err.message : String(err), variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["resources", pagination, sorting, debouncedSearch, statusFilter, typeFilter],
    queryFn: () => {
      const sortField = sorting[0]?.id ?? "createdAt";
      const sortDirection = sorting[0]?.desc ? "desc" : "asc";

      const p = new URLSearchParams({
        page: String(pagination.pageIndex + 1),
        limit: String(pagination.pageSize),
        sortBy: sortField,
        sortDir: sortDirection,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(statusFilter && statusFilter !== "all" ? { status: statusFilter } : {}),
        ...(typeFilter && typeFilter !== "all" ? { type: typeFilter } : {}),
      });
      return apiFetch<ResourcesResponse>(`/resources?${p}`);
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["resources"] });

  const saveMutation = useMutation({
    mutationFn: ({ id, body }: { id?: string; body: Partial<Resource> }) =>
      id
        ? apiFetch<Resource>(`/resources/${id}`, { method: "PATCH", body: JSON.stringify(body) })
        : apiFetch<Resource>("/resources", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: (_, variables) => {
      invalidate();
      toast({ title: variables.id ? "Resource updated" : "Resource created", description: "Your changes have been saved." });
      setEditor({ open: false, item: null });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch(`/resources/${id}/publish`, { method: "POST", body: JSON.stringify({ status }) }),
    onSuccess: () => {
      invalidate();
      toast({ title: "Status updated", description: "Resource status transitioned successfully." });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/resources/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      toast({ title: "Resource deleted", description: "The resource has been removed." });
      setDeleteTarget(null);
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editor.open) return;
    const formData = new FormData(e.currentTarget);
    const item = editor.item;
    const tagsRaw = (formData.get("tags") as string) ?? "";
    const existingMetadata = (item?.metadata ?? {}) as Record<string, unknown>;
    const activeBodyHtml = hideType
      ? (bodyMode === "source" ? bodyHtml : (bodyEditorRef.current?.innerHTML ?? bodyHtml))
      : "";
    const resolvedAuthor = author === "Custom" ? (customAuthor.trim() || undefined) : author;
    const body: Partial<Resource> = {
      title: formData.get("title") as string,
      slug: ((formData.get("slug") as string) || undefined),
      type: hideType ? "DOCUMENT" : (formData.get("type") as string),
      description: (formData.get("description") as string) || undefined,
      ...(!hideType
        ? {
            fileUrl: (formData.get("fileUrl") as string) || undefined,
            externalUrl: (formData.get("externalUrl") as string) || undefined,
            isGated: formData.get("isGated") === "true",
          }
        : {
            fileUrl: item?.fileUrl,
            externalUrl: item?.externalUrl,
            isGated: item?.isGated ?? false,
          }),
      thumbnailId: thumbnailId || undefined,
      category: (formData.get("category") as string) || (hideType ? "blog" : undefined),
      tags: tagsRaw.split(",").map((t) => t.trim()).filter(Boolean),
      seoTitle: seoTitle || undefined,
      seoDesc: seoDesc || undefined,
      metadata: {
        ...existingMetadata,
        ...(hideType
          ? {
              bodyHtml: activeBodyHtml,
              author: resolvedAuthor,
              featuredImageAlt: featuredImageAlt || undefined,
            }
          : {}),
      },
    };
    saveMutation.mutate({ id: item?.id, body });
  };

  const editorFormId = "resource-editor-form";

  const columns: ColumnDef<Resource>[] = [
    {
      accessorKey: "title",
      header: "Resource",
      cell: ({ row }) => (
        <div>
          <button onClick={() => setEditor({ open: true, item: row.original })} className="text-sm font-medium text-foreground hover:text-primary text-left transition-colors">
            {row.original.title}
          </button>
          <p className="text-xs text-muted-foreground font-mono">/{row.original.slug}</p>
        </div>
      ),
    },
    ...(!hideType
      ? [{
          accessorKey: "type",
          header: "Type",
          cell: ({ row }) => (
            <Badge variant="outline" className="text-xs">
              {RESOURCE_TYPE_LABELS[row.original.type] ?? row.original.type}
            </Badge>
          ),
        } satisfies ColumnDef<Resource>]
      : []),
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} domain="resource" />,
    },
    {
      accessorKey: "downloadCount",
      header: hideType ? "Views" : "Downloads",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.downloadCount ?? 0}</span>
      ),
    },
    {
      accessorKey: "publishedAt",
      header: "Published",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.original.publishedAt)}</span>
      ),
    },
    {
      id: "actions",
      size: 50,
      cell: ({ row }) => {
        const r = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditor({ open: true, item: r })} className="cursor-pointer">
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              {r.fileUrl && (
                <DropdownMenuItem asChild>
                  <a href={r.fileUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Resource
                  </a>
                </DropdownMenuItem>
              )}
              {r.status !== "PUBLISHED" && (
                <DropdownMenuItem onClick={() => publishMutation.mutate({ id: r.id, status: "PUBLISHED" })} className="cursor-pointer">
                  <Globe className="mr-2 h-4 w-4 text-emerald-400" /> Publish
                </DropdownMenuItem>
              )}
              {r.status === "PUBLISHED" && (
                <DropdownMenuItem onClick={() => publishMutation.mutate({ id: r.id, status: "DRAFT" })} className="cursor-pointer">
                  <Globe className="mr-2 h-4 w-4 text-amber-400" /> Unpublish
                </DropdownMenuItem>
              )}
              {r.status !== "ARCHIVED" && (
                <DropdownMenuItem onClick={() => publishMutation.mutate({ id: r.id, status: "ARCHIVED" })} className="cursor-pointer">
                  <Archive className="mr-2 h-4 w-4" /> Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setDeleteTarget(r)} className="cursor-pointer text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={title}
        description={`${data?.total ?? 0} ${description}`}
        action={
          <Button onClick={() => setEditor({ open: true, item: null })} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" />
            {hideType ? "Create Article" : "Create Resource"}
          </Button>
        }
      />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            {["all", "DRAFT", "PUBLISHED", "ARCHIVED"].map((s) => (
              <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : s.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!hideType && (
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {RESOURCE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{RESOURCE_TYPE_LABELS[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {isError && (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-rose-400" />
          <div>
            <h3 className="text-base font-bold text-white">Failed to Load Resources</h3>
            <p className="text-xs text-muted-foreground mt-1 font-mono">{error?.message || "Internal server error"}</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" className="border-white/10 text-xs font-bold hover:bg-white/5">
            Retry Loading
          </Button>
        </div>
      )}

      {!isError && (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          loading={isLoading}
          pageCount={data?.total ? Math.ceil(data.total / pagination.pageSize) : 0}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
        />
      )}

      {/* Create / Edit dialog */}
      <Dialog open={editor.open} onOpenChange={(o) => !o && setEditor({ open: false, item: null })}>
        <DialogContent className="max-w-2xl glass-panel border-white/10 bg-slate-900/95">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white">
              {editor.item ? (hideType ? "Edit Article" : "Edit Resource") : hideType ? "Create Article" : "Create Resource"}
            </DialogTitle>
          </DialogHeader>
          {editor.open && (
            <form id={editorFormId} onSubmit={handleSave} className="space-y-4 pt-2 max-h-[65vh] overflow-y-auto pr-1">
              {hideType ? (
                <div className="space-y-1.5">
                  <Label>Title *</Label>
                  <Input name="title" required defaultValue={editor.item?.title ?? ""} placeholder="e.g. How to Become a Pilot in India 2026" className="bg-secondary/40 border-white/10 text-xs text-white" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Title *</Label>
                    <Input name="title" required defaultValue={editor.item?.title ?? ""} placeholder="e.g. DGCA Exam Guide 2025" className="bg-secondary/40 border-white/10 text-xs text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Type *</Label>
                    <select name="type" required defaultValue={editor.item?.type ?? "DOCUMENT"} className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/60 px-3 py-1 text-xs font-bold text-white focus-visible:outline-none">
                      {RESOURCE_TYPES.map((t) => (
                        <option key={t} value={t} className="bg-slate-900">{RESOURCE_TYPE_LABELS[t]}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>URL Slug (lowercase, hyphens)</Label>
                  <Input name="slug" defaultValue={editor.item?.slug ?? ""} placeholder="e.g. how-to-become-pilot-india" className="bg-secondary/40 border-white/10 text-xs text-white font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Input name="category" defaultValue={editor.item?.category ?? (hideType ? "blog" : "")} placeholder="e.g. Pilot Training, DGCA Exams" className="bg-secondary/40 border-white/10 text-xs text-white" />
                </div>
              </div>

              {hideType && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Author</Label>
                    <select
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/60 px-3 py-1 text-xs font-bold text-white focus-visible:outline-none"
                    >
                      <option value="Capt. Navrang Singh" className="bg-slate-900">Capt. Navrang Singh, Co-founder</option>
                      <option value="Deepak Aggarwal" className="bg-slate-900">Deepak Aggarwal, Co-founder</option>
                      <option value="Airborne Editorial Team" className="bg-slate-900">Airborne Editorial Team</option>
                      <option value="Custom" className="bg-slate-900">Custom Author...</option>
                    </select>
                  </div>
                  {author === "Custom" ? (
                    <div className="space-y-1.5">
                      <Label>Custom Author Name</Label>
                      <Input
                        value={customAuthor}
                        onChange={(e) => setCustomAuthor(e.target.value)}
                        placeholder="Author name & title"
                        className="bg-secondary/40 border-white/10 text-xs text-white"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Label>Author Role</Label>
                      <Input
                        disabled
                        value={author === "Airborne Editorial Team" ? "Editorial Team" : "Co-founder"}
                        className="bg-secondary/20 border-white/5 text-xs text-muted-foreground"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Description / Excerpt</Label>
                <Textarea name="description" defaultValue={editor.item?.description ?? ""} rows={3} placeholder="Summary shown on the public site and preview cards..." className="bg-secondary/40 border-white/10 text-xs text-white leading-relaxed" />
              </div>

              {hideType && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label>Article body ({bodyMode === "source" ? "HTML source view" : "rich text"})</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant={bodyMode === "source" ? "secondary" : "ghost"}
                      className="h-6 px-2 text-[10px] gap-1 font-mono text-muted-foreground hover:text-white"
                      onClick={() => {
                        if (bodyMode === "visual") {
                          const currentHtml = bodyEditorRef.current?.innerHTML || bodyHtml;
                          setBodyHtml(currentHtml);
                          setBodyMode("source");
                        } else {
                          setBodyMode("visual");
                          setTimeout(() => {
                            if (bodyEditorRef.current) {
                              bodyEditorRef.current.innerHTML = bodyHtml;
                            }
                          }, 0);
                        }
                      }}
                    >
                      {bodyMode === "source" ? <Eye className="h-3 w-3 mr-1" /> : <Code className="h-3 w-3 mr-1" />}
                      {bodyMode === "source" ? "Visual Editor" : "HTML Source"}
                    </Button>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-secondary/40">
                    {bodyMode === "visual" && (
                      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 p-1.5 bg-slate-900/60">
                        <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" title="Bold" onClick={() => execEditor("bold")}>
                          <Bold className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" title="Italic" onClick={() => execEditor("italic")}>
                          <Italic className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" title="Heading 2" onClick={() => execEditor("formatBlock", "h2")}>
                          <Heading2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" title="Heading 3" onClick={() => execEditor("formatBlock", "h3")}>
                          <Heading3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" title="Bullet list" onClick={() => execEditor("insertUnorderedList")}>
                          <List className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" title="Numbered list" onClick={() => execEditor("insertOrderedList")}>
                          <ListOrdered className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" title="Blockquote" onClick={() => execEditor("formatBlock", "blockquote")}>
                          <Quote className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" title="Insert Table" onClick={insertTable}>
                          <Table className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" title="Insert Image" onClick={insertImage}>
                          <Image className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" title="Insert link" onClick={insertLink}>
                          <Link2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                    {bodyMode === "visual" ? (
                      <div
                        ref={bodyEditorRef}
                        data-testid="article-body"
                        contentEditable
                        suppressContentEditableWarning
                        role="textbox"
                        aria-multiline="true"
                        aria-label="Article body"
                        onInput={(e) => setBodyHtml(e.currentTarget.innerHTML)}
                        className="min-h-[220px] max-h-[380px] overflow-y-auto p-3 text-xs text-white leading-relaxed focus:outline-none [&_h2]:text-sm [&_h2]:font-bold [&_h3]:text-xs [&_h3]:font-semibold [&_a]:text-primary [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_blockquote]:italic [&_table]:border-collapse [&_table]:w-full [&_table]:my-2 [&_th]:border [&_th]:border-white/20 [&_th]:p-1.5 [&_td]:border [&_td]:border-white/20 [&_td]:p-1.5"
                      />
                    ) : (
                      <Textarea
                        value={bodyHtml}
                        onChange={(e) => setBodyHtml(e.target.value)}
                        rows={12}
                        placeholder="Paste or write HTML markup here directly..."
                        className="font-mono text-xs text-emerald-300 bg-slate-950/80 p-3 leading-relaxed border-0 rounded-b-lg focus-visible:ring-0"
                      />
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Rich text is stored as HTML in the article record — no artificial character limit.
                  </p>
                </div>
              )}

              {!hideType && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>File (upload or paste URL)</Label>
                    <div className="flex gap-2">
                      <Input ref={fileUrlRef} name="fileUrl" defaultValue={editor.item?.fileUrl ?? ""} placeholder="https://..." className="bg-secondary/40 border-white/10 text-xs text-white" />
                      <input
                        ref={fileInputRef}
                        type="file"
                        data-testid="resource-file-input"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,image/*,video/mp4,audio/mpeg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = "";
                          if (file) uploadFile(file);
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-white/10 text-xs font-semibold shrink-0"
                      >
                        <Upload className="h-3.5 w-3.5 mr-1.5" />
                        {uploading ? "Uploading..." : "Upload"}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>External URL</Label>
                    <Input name="externalUrl" defaultValue={editor.item?.externalUrl ?? ""} placeholder="https://..." className="bg-secondary/40 border-white/10 text-xs text-white" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Featured Thumbnail</Label>
                  <MediaPicker
                    value={thumbnailId}
                    onChange={(id) => setThumbnailId(id ?? null)}
                    label="thumbnail"
                  />
                </div>
                {hideType ? (
                  <div className="space-y-1.5">
                    <Label>Featured Image Alt Text</Label>
                    <Input
                      value={featuredImageAlt}
                      onChange={(e) => setFeaturedImageAlt(e.target.value)}
                      placeholder="Descriptive alt text for SEO"
                      className="bg-secondary/40 border-white/10 text-xs text-white"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label>Access</Label>
                    <select name="isGated" defaultValue={editor.item?.isGated ? "true" : "false"} className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/60 px-3 py-1 text-xs font-bold text-white focus-visible:outline-none">
                      <option value="false" className="bg-slate-900">Public (direct download)</option>
                      <option value="true" className="bg-slate-900">Gated (lead form required)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Tags (comma separated)</Label>
                <Input name="tags" defaultValue={editor.item?.tags?.join(", ") ?? ""} placeholder="exam, dgca, study-guide" className="bg-secondary/40 border-white/10 text-xs text-white" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>SEO Meta Title</Label>
                  <span className={`text-[10px] font-mono ${seoTitle.length >= 50 && seoTitle.length <= 60 ? 'text-emerald-400 font-semibold' : seoTitle.length > 60 ? 'text-amber-400 font-semibold' : 'text-muted-foreground'}`}>
                    {seoTitle.length} chars (recommended: 50–60)
                  </span>
                </div>
                <Input
                  name="seoTitle"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="e.g. Commercial Pilot Training in India - Guide 2026"
                  className="bg-secondary/40 border-white/10 text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>SEO Meta Description</Label>
                  <span className={`text-[10px] font-mono ${seoDesc.length >= 140 && seoDesc.length <= 160 ? 'text-emerald-400 font-semibold' : seoDesc.length > 160 ? 'text-amber-400 font-semibold' : 'text-muted-foreground'}`}>
                    {seoDesc.length} chars (recommended: 140–160)
                  </span>
                </div>
                <Textarea
                  name="seoDesc"
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  rows={2}
                  placeholder="Compelling search snippet summary (140–160 characters recommended)..."
                  className="bg-secondary/40 border-white/10 text-xs text-white"
                />
              </div>
            </form>
          )}
          <DialogFooter className="pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={() => setEditor({ open: false, item: null })} className="border-white/10 text-xs font-bold">Cancel</Button>
            <Button type="submit" form={editorFormId} disabled={saveMutation.isPending} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold">
              {saveMutation.isPending ? "Saving..." : editor.item ? "Save Changes" : hideType ? "Create Article" : "Create Resource"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Resource"
        description={`"${deleteTarget?.title ?? ""}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
