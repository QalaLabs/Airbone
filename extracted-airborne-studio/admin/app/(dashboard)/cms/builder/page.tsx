"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LayoutTemplate,
  Search,
  Plus,
  Globe,
  Clock,
  Archive,
  ExternalLink,
  Edit2,
  Copy,
  Trash2,
  Sparkles,
  Layers,
  Loader2,
  AlertCircle,
  FileText,
  Check,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { apiFetch } from "@/lib/api";
import { STARTER_TEMPLATES } from "@/components/builder/component-registry";
import type { PageModel, PageStatus } from "@/types";

const STATUS_CHIP: Record<PageStatus, string> = {
  PUBLISHED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  SCHEDULED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  DRAFT: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  ARCHIVED: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

export default function VisualBuilderHubPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>("cadet_page");

  // New Page form state
  const [newTitle, setNewTitle] = React.useState("");
  const [newSlug, setNewSlug] = React.useState("");
  const [newDesc, setNewDesc] = React.useState("");
  const [autoSlug, setAutoSlug] = React.useState(true);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setNewTitle(val);
    if (autoSlug) {
      setNewSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/[\s]+/g, "-"),
      );
    }
  };

  const { data: pages = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["builder-pages-list"],
    queryFn: () => apiFetch<PageModel[]>("/pages?limit=100"),
  });

  const createPageMutation = useMutation({
    mutationFn: async () => {
      const template = STARTER_TEMPLATES.find((t) => t.id === selectedTemplateId);
      const res = await apiFetch<PageModel>("/pages", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle,
          slug: newSlug || undefined,
          description: newDesc || undefined,
          metadata: {
            starterTemplate: selectedTemplateId,
            studioDraft: {
              sections: template?.sections || [],
            },
          },
        }),
      });
      return res;
    },
    onSuccess: (newPage) => {
      queryClient.invalidateQueries({ queryKey: ["builder-pages-list"] });
      setCreateDialogOpen(false);
      setNewTitle("");
      setNewSlug("");
      setNewDesc("");
      toast({
        title: "Page Created",
        description: `"${newPage.title}" created. Opening Airborne Studio...`,
      });
      router.push(`/cms/builder/${newPage.id}`);
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: err.message || "Could not create page",
      });
    },
  });

  // Filtered pages
  const filteredPages = React.useMemo(() => {
    return pages.filter((p) => {
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [pages, search, statusFilter]);

  // Quick stats
  const stats = React.useMemo(() => {
    const total = pages.length;
    const published = pages.filter((p) => p.status === "PUBLISHED").length;
    const drafts = pages.filter((p) => p.status === "DRAFT").length;
    const scheduled = pages.filter((p) => p.status === "SCHEDULED").length;
    return { total, published, drafts, scheduled };
  }, [pages]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Airborne Studio — Visual Website Builder"
        description="Design and manage high-conversion course pages and marketing funnels with drag-and-drop Airborne components."
        action={
          <Button
            type="button"
            onClick={() => setCreateDialogOpen(true)}
            className="bg-primary text-white hover:bg-primary/90 text-xs font-bold shadow-md shadow-primary/20"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create New Page
          </Button>
        }
      />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-white/10 bg-secondary/30">
          <p className="text-xs text-muted-foreground font-semibold">Total Pages</p>
          <p className="text-2xl font-black text-white mt-1">{stats.total}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-secondary/30">
          <p className="text-xs text-muted-foreground font-semibold">Published Live</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{stats.published}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-secondary/30">
          <p className="text-xs text-muted-foreground font-semibold">In Draft</p>
          <p className="text-2xl font-black text-amber-400 mt-1">{stats.drafts}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-secondary/30">
          <p className="text-xs text-muted-foreground font-semibold">Scheduled</p>
          <p className="text-2xl font-black text-blue-400 mt-1">{stats.scheduled}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search pages by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary/40 border-white/10 text-xs text-white"
          />
        </div>

        <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-lg border border-white/10 w-full sm:w-auto overflow-x-auto">
          {["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                statusFilter === s ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
              }`}
            >
              {s.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Pages Grid */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="p-12 text-center border border-white/10 rounded-xl bg-secondary/20">
          <AlertCircle className="h-8 w-8 text-rose-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-white">Failed to load pages</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3 text-xs border-white/10">
            Retry
          </Button>
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-white/10 rounded-2xl bg-secondary/10 space-y-3">
          <LayoutTemplate className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="text-base font-bold text-white">No pages match your filter</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Create a new page with Airborne Studio or clear your search query.
          </p>
          <Button
            type="button"
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="bg-primary text-white text-xs font-bold"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Create Page
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPages.map((page) => (
            <div
              key={page.id}
              className="rounded-2xl border border-white/10 bg-secondary/30 hover:border-white/20 transition-all p-5 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className={`text-[10px] font-bold ${STATUS_CHIP[page.status]}`}>
                    {page.status}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">v{page.version}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                    {page.title}
                  </h3>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">/pages/{page.slug}</p>
                </div>

                {page.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{page.description}</p>
                )}
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <a
                    href={`https://www.airborneaviation.in/pages/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 w-8 rounded-lg border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                    title="View live website"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                <Button
                  asChild
                  size="sm"
                  className="bg-primary text-white hover:bg-primary/90 text-xs font-bold shadow-md shadow-primary/20"
                >
                  <Link href={`/cms/builder/${page.id}`}>
                    <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                    Open in Studio
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create New Page Modal */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl glass-panel border-white/10 bg-slate-900/95 text-white p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Create New Visual Page
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Page Title</label>
              <Input
                value={newTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Airline Cadet Preparation Program"
                className="bg-secondary/40 border-white/10 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">URL Slug</label>
              <div className="flex items-center rounded-md border border-white/10 bg-secondary/40 px-3 py-1.5 text-xs">
                <span className="text-muted-foreground">/pages/</span>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => {
                    setAutoSlug(false);
                    setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                  }}
                  placeholder="cadet-preparation"
                  className="bg-transparent text-white focus:outline-none flex-1 ml-1"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Short Description (Optional)</label>
              <Textarea
                rows={2}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Internal summary of this page..."
                className="bg-secondary/40 border-white/10 text-xs text-white"
              />
            </div>

            {/* Starter Template Selection */}
            <div className="space-y-2 border-t border-white/10 pt-3">
              <label className="text-xs font-bold text-white uppercase tracking-wider text-primary">
                Select Starter Template
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {STARTER_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tmpl.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedTemplateId === tmpl.id
                        ? "border-primary bg-primary/20 ring-1 ring-primary"
                        : "border-white/10 bg-secondary/30 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{tmpl.name}</span>
                      {selectedTemplateId === tmpl.id && <Check className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{tmpl.description}</p>
                    <Badge variant="outline" className="mt-2 text-[9px] border-white/10 text-muted-foreground">
                      {tmpl.badge}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-white/10 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCreateDialogOpen(false)}
              className="border-white/10 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => createPageMutation.mutate()}
              disabled={!newTitle.trim() || createPageMutation.isPending}
              className="bg-primary text-white hover:bg-primary/90 text-xs font-bold"
            >
              {createPageMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
              Create & Launch Studio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
