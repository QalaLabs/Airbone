"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  EyeOff,
  History,
  Settings2,
  Save,
  Globe,
  Loader2,
  Sparkles,
  Layers,
  Search,
  Plus,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Trash2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiFetch, ApiClientError } from "@/lib/api";
import {
  COMPONENT_CATEGORIES,
  COMPONENT_REGISTRY,
  STARTER_TEMPLATES,
  type ComponentDefinition,
} from "./component-registry";
import { VisualCanvas } from "./visual-canvas";
import { RightInspector } from "./right-inspector";
import type { PageModel, PageStatus, PageVersionModel } from "@/types";

interface AirborneStudioProps {
  pageId: string;
}

export function AirborneStudio({ pageId }: AirborneStudioProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ─── Query server data ────────────────────────────────────────────────────────
  const {
    data: initialPage,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["cms-studio-page", pageId],
    queryFn: () => apiFetch<PageModel>(`/pages/${pageId}`),
  });

  const { data: allPages = [] } = useQuery({
    queryKey: ["cms-studio-all-pages"],
    queryFn: async () => {
      const res = await apiFetch<PageModel[]>("/pages?limit=100");
      return res;
    },
  });

  const { data: versions = [], refetch: refetchVersions } = useQuery({
    queryKey: ["cms-studio-versions", pageId],
    queryFn: () => apiFetch<PageVersionModel[]>(`/pages/${pageId}/versions`),
    enabled: !!pageId,
  });

  // ─── Undo / Redo History State ──────────────────────────────────────────────
  const [history, setHistory] = React.useState<{
    past: PageModel[];
    present: PageModel | null;
    future: PageModel[];
  }>({
    past: [],
    present: null,
    future: [],
  });

  const [saving, setSaving] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);
  const [device, setDevice] = React.useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewMode, setPreviewMode] = React.useState(false);
  const [leftTab, setLeftTab] = React.useState<"widgets" | "layers">("widgets");
  const [componentCategory, setComponentCategory] = React.useState<string>("all");
  const [componentSearch, setComponentSearch] = React.useState("");
  const [publishDialogOpen, setPublishDialogOpen] = React.useState(false);
  const [versionsDrawerOpen, setVersionsDrawerOpen] = React.useState(false);
  const [publishNotes, setPublishNotes] = React.useState("");

  // Selection state
  const [selection, setSelection] = React.useState<
    | { type: "block"; sectionId: string; blockId: string }
    | { type: "section"; sectionId: string }
    | { type: "page" }
    | null
  >(null);

  // Initialize present from server page
  React.useEffect(() => {
    if (initialPage && !history.present) {
      setHistory({
        past: [],
        present: structuredClone(initialPage),
        future: [],
      });
    }
  }, [initialPage, history.present]);

  const page = history.present;

  // Unsaved changes warning
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // ─── Push State Helper ──────────────────────────────────────────────────────
  const pushState = React.useCallback(
    (newPresent: PageModel) => {
      setHistory((prev) => {
        if (!prev.present) return prev;
        return {
          past: [...prev.past.slice(-40), prev.present],
          present: newPresent,
          future: [],
        };
      });
      setIsDirty(true);
    },
    [],
  );

  const undo = React.useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0 || !prev.present) return prev;
      const previous = prev.past[prev.past.length - 1];
      if (!previous) return prev;
      const newPast = prev.past.slice(0, prev.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
    setIsDirty(true);
  }, []);

  const redo = React.useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0 || !prev.present) return prev;
      const next = prev.future[0];
      if (!next) return prev;
      const newFuture = prev.future.slice(1);
      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
    setIsDirty(true);
  }, []);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveDraft();
      } else if (e.key === "Escape") {
        setSelection(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // ─── Block & Section Mutation Handlers ──────────────────────────────────────
  const handleUpdatePageMeta = (patch: Partial<PageModel>) => {
    if (!page) return;
    const updated = { ...page, ...patch };
    pushState(updated);
  };

  const handleAddSection = (atIndex?: number) => {
    if (!page) return;
    const newSection = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: `Section ${(page.sections?.length || 0) + 1}`,
      order: atIndex !== undefined ? atIndex : page.sections?.length || 0,
      isVisible: true,
      settings: { background: "white", padding: "normal", maxWidth: "standard" },
      blocks: [],
    };
    const updatedSections = [...(page.sections || [])];
    if (atIndex !== undefined) {
      updatedSections.splice(atIndex, 0, newSection as any);
    } else {
      updatedSections.push(newSection as any);
    }
    // Re-index order
    updatedSections.forEach((s, idx) => (s.order = idx));
    pushState({ ...page, sections: updatedSections });
    setSelection({ type: "section", sectionId: newSection.id });
  };

  const handleUpdateSection = (sectionId: string, patch: Record<string, any>) => {
    if (!page) return;
    const updatedSections = (page.sections || []).map((s: any) => {
      if (s.id === sectionId) {
        return { ...s, ...patch };
      }
      return s;
    });
    pushState({ ...page, sections: updatedSections });
  };

  const handleMoveSection = (sectionId: string, direction: "up" | "down") => {
    if (!page) return;
    const idx = page.sections.findIndex((s: any) => s.id === sectionId);
    if (idx < 0) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= page.sections.length) return;

    const updatedSections = [...page.sections];
    const [moved] = updatedSections.splice(idx, 1);
    if (!moved) return;
    updatedSections.splice(targetIdx, 0, moved);
    updatedSections.forEach((s, i) => (s.order = i));

    pushState({ ...page, sections: updatedSections });
  };

  const handleDuplicateSection = (sectionId: string) => {
    if (!page) return;
    const idx = page.sections.findIndex((s: any) => s.id === sectionId);
    if (idx < 0) return;
    const original = page.sections[idx];
    if (!original) return;
    const cloned = structuredClone(original);
    if (!cloned) return;
    cloned.id = `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    cloned.name = `${original.name || "Section"} (Copy)`;
    cloned.blocks = (cloned.blocks || []).map((b: any) => ({
      ...b,
      id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sectionId: cloned.id,
    }));

    const updatedSections = [...page.sections];
    updatedSections.splice(idx + 1, 0, cloned);
    updatedSections.forEach((s, i) => (s.order = i));

    pushState({ ...page, sections: updatedSections });
    setSelection({ type: "section", sectionId: cloned.id });
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!page) return;
    const updatedSections = page.sections.filter((s: any) => s.id !== sectionId);
    updatedSections.forEach((s, i) => (s.order = i));
    pushState({ ...page, sections: updatedSections });
    if (selection?.type === "section" && selection.sectionId === sectionId) {
      setSelection(null);
    }
  };

  const handleAddBlock = (sectionId: string, blockType: string) => {
    if (!page) return;
    const def = COMPONENT_REGISTRY.find((c) => c.type === blockType);
    const newBlock = {
      id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sectionId,
      blockTypeId: blockType,
      order: 0,
      props: structuredClone(def?.defaultProps || {}),
      isVisible: true,
      blockType: {
        id: blockType,
        type: blockType,
        name: def?.title || blockType,
        schema: {},
        defaultProps: {},
      },
    };

    const updatedSections = page.sections.map((s: any) => {
      if (s.id === sectionId) {
        const blocks = [...(s.blocks || []), newBlock];
        blocks.forEach((b: any, i: number) => (b.order = i));
        return { ...s, blocks };
      }
      return s;
    });

    pushState({ ...page, sections: updatedSections });
    setSelection({ type: "block", sectionId, blockId: newBlock.id });
  };

  const handleUpdateBlockProps = (sectionId: string, blockId: string, patch: Record<string, any>) => {
    if (!page) return;
    const updatedSections = page.sections.map((s: any) => {
      if (s.id === sectionId) {
        const blocks = (s.blocks || []).map((b: any) => {
          if (b.id === blockId) {
            return { ...b, props: { ...b.props, ...patch } };
          }
          return b;
        });
        return { ...s, blocks };
      }
      return s;
    });
    pushState({ ...page, sections: updatedSections });
  };

  const handleUpdateBlockStyle = (sectionId: string, blockId: string, patch: Record<string, any>) => {
    handleUpdateBlockProps(sectionId, blockId, patch);
  };

  const handleUpdateBlockResponsive = (sectionId: string, blockId: string, patch: Record<string, any>) => {
    handleUpdateBlockProps(sectionId, blockId, patch);
  };

  const handleMoveBlock = (sectionId: string, blockId: string, direction: "up" | "down") => {
    if (!page) return;
    const updatedSections = page.sections.map((s: any) => {
      if (s.id === sectionId) {
        const blocks = [...(s.blocks || [])];
        const idx = blocks.findIndex((b: any) => b.id === blockId);
        if (idx < 0) return s;
        const targetIdx = direction === "up" ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= blocks.length) return s;

        const [moved] = blocks.splice(idx, 1);
        if (!moved) return s;
        blocks.splice(targetIdx, 0, moved);
        blocks.forEach((b: any, i: number) => (b.order = i));
        return { ...s, blocks };
      }
      return s;
    });
    pushState({ ...page, sections: updatedSections });
  };

  const handleDuplicateBlock = (sectionId: string, blockId: string) => {
    if (!page) return;
    const updatedSections = page.sections.map((s: any) => {
      if (s.id === sectionId) {
        const blocks = [...(s.blocks || [])];
        const idx = blocks.findIndex((b: any) => b.id === blockId);
        if (idx < 0) return s;
        const original = blocks[idx];
        const cloned = structuredClone(original);
        cloned.id = `blk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        blocks.splice(idx + 1, 0, cloned);
        blocks.forEach((b: any, i: number) => (b.order = i));
        return { ...s, blocks };
      }
      return s;
    });
    pushState({ ...page, sections: updatedSections });
  };

  const handleDeleteBlock = (sectionId: string, blockId: string) => {
    if (!page) return;
    const updatedSections = page.sections.map((s: any) => {
      if (s.id === sectionId) {
        const blocks = (s.blocks || []).filter((b: any) => b.id !== blockId);
        blocks.forEach((b: any, i: number) => (b.order = i));
        return { ...s, blocks };
      }
      return s;
    });
    pushState({ ...page, sections: updatedSections });
    if (selection?.type === "block" && selection.blockId === blockId) {
      setSelection(null);
    }
  };

  // ─── Save Draft to Backend ──────────────────────────────────────────────────
  const handleSaveDraft = async () => {
    if (!page) return;
    setSaving(true);
    try {
      // 1. Update page metadata
      await apiFetch(`/pages/${page.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: page.title,
          slug: page.slug,
          description: page.description,
          seoTitle: page.seoTitle,
          seoDesc: page.seoDesc,
          seoKeywords: page.seoKeywords,
          ogImage: page.ogImage,
          metadata: {
            ...page.metadata,
            studioDraft: {
              sections: page.sections,
              lastSavedAt: new Date().toISOString(),
            },
          },
        }),
      });

      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ["cms-studio-page", pageId] });
      toast({
        title: "Draft Saved",
        description: `Page "${page.title}" was saved successfully.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: err.message || "Failed to save draft",
      });
    } finally {
      setSaving(false);
    }
  };

  // ─── Publish Page ───────────────────────────────────────────────────────────
  const publishMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ page: PageModel; version: unknown }>(`/pages/${pageId}/publish`, {
        method: "POST",
        body: JSON.stringify({
          status: "PUBLISHED",
          notes: publishNotes || "Published from Airborne Studio",
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-studio-page", pageId] });
      refetchVersions();
      setPublishDialogOpen(false);
      setIsDirty(false);
      toast({
        title: "Page Published Live!",
        description: `Page is now live at https://www.airborneaviation.in/pages/${page?.slug}`,
      });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: "Publish Failed",
        description: err.message || "Failed to publish page",
      });
    },
  });

  const handleRollbackVersion = async (version: number) => {
    try {
      await apiFetch(`/pages/${pageId}/rollback`, {
        method: "POST",
        body: JSON.stringify({ version }),
      });
      queryClient.invalidateQueries({ queryKey: ["cms-studio-page", pageId] });
      refetch();
      setVersionsDrawerOpen(false);
      toast({
        title: "Version Restored",
        description: `Restored version ${version} successfully.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Rollback Failed",
        description: err.message || "Failed to restore version",
      });
    }
  };

  // Filtered components for palette
  const filteredComponents = React.useMemo(() => {
    return COMPONENT_REGISTRY.filter((c) => {
      const matchCat = componentCategory === "all" || c.category === componentCategory;
      const matchSearch =
        !componentSearch ||
        c.title.toLowerCase().includes(componentSearch.toLowerCase()) ||
        c.description.toLowerCase().includes(componentSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [componentCategory, componentSearch]);

  if (isLoading || !page) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-3 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">Launching Airborne Studio...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-white">
        <AlertCircle className="h-10 w-10 text-rose-400" />
        <h2 className="text-base font-bold">Failed to load page in Airborne Studio</h2>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="border-white/10 text-xs">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-50 flex flex-col bg-slate-950 text-white overflow-hidden">
      {/* ─── TOP TOOLBAR ────────────────────────────────────────────────────── */}
      <header className="h-14 shrink-0 border-b border-white/10 bg-slate-900/95 px-4 flex items-center justify-between gap-4 z-40">
        {/* Left: Back & Page Info */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/cms/builder"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
            title="Back to Pages Hub"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 max-w-[260px] text-left hover:bg-white/5 p-1 rounded-md transition-colors"
              >
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate">{page.title}</span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] px-1 py-0 h-4 border-none font-bold ${
                        page.status === "PUBLISHED"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {page.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">/pages/{page.slug}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 glass-panel border-white/10 bg-slate-900/95 text-white">
              <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Switch Page
              </div>
              {allPages.slice(0, 10).map((p: any) => (
                <DropdownMenuItem
                  key={p.id}
                  onClick={() => router.push(`/cms/builder/${p.id}`)}
                  className="flex items-center justify-between text-xs cursor-pointer hover:bg-white/10"
                >
                  <span className="truncate">{p.title}</span>
                  <span className="text-[10px] text-muted-foreground">v{p.version}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Live Link */}
          <a
            href={`https://www.airborneaviation.in/pages/${page.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
            title="View live website page"
          >
            <Globe className="h-3.5 w-3.5" />
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>

        {/* Center: Device Switcher & Undo/Redo */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-0.5">
            <button
              type="button"
              disabled={history.past.length === 0}
              onClick={undo}
              className="p-1.5 text-muted-foreground hover:text-white disabled:opacity-30 rounded hover:bg-white/5"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={history.future.length === 0}
              onClick={redo}
              className="p-1.5 text-muted-foreground hover:text-white disabled:opacity-30 rounded hover:bg-white/5"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Responsive Device Switcher */}
          <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-0.5">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              className={`p-1.5 rounded text-xs transition-colors ${
                device === "desktop" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
              }`}
              title="Desktop (100%)"
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDevice("tablet")}
              className={`p-1.5 rounded text-xs transition-colors ${
                device === "tablet" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
              }`}
              title="Tablet (768px)"
            >
              <Tablet className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              className={`p-1.5 rounded text-xs transition-colors ${
                device === "mobile" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
              }`}
              title="Mobile (375px)"
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Preview Toggle */}
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              previewMode
                ? "border-primary bg-primary/20 text-primary"
                : "border-white/10 bg-white/5 text-muted-foreground hover:text-white"
            }`}
            title="Toggle preview frame"
          >
            {previewMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span className="hidden md:inline">{previewMode ? "Edit Mode" : "Preview"}</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-muted-foreground mr-2">
            {saving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                <span>Saving...</span>
              </>
            ) : isDirty ? (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-400">Unsaved changes</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Saved</span>
              </>
            )}
          </div>

          {/* Version History Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs font-semibold text-muted-foreground hover:text-white border border-white/10"
            onClick={() => setVersionsDrawerOpen(true)}
            title="Version History & Rollback"
          >
            <History className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">v{page.version}</span>
          </Button>

          {/* Page Settings */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-8 text-xs font-semibold border ${
              selection?.type === "page"
                ? "border-primary text-primary bg-primary/10"
                : "border-white/10 text-muted-foreground hover:text-white"
            }`}
            onClick={() => setSelection({ type: "page" })}
            title="Page SEO & Settings"
          >
            <Settings2 className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">Settings</span>
          </Button>

          {/* Save Draft */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={saving}
            className="h-8 border-white/10 text-xs font-bold text-white hover:bg-white/10"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
            Save Draft
          </Button>

          {/* Publish Button */}
          <Button
            type="button"
            size="sm"
            onClick={() => setPublishDialogOpen(true)}
            className="h-8 bg-primary text-white hover:bg-primary/90 text-xs font-bold shadow-md shadow-primary/20"
          >
            <Globe className="h-3.5 w-3.5 mr-1.5" />
            Publish
          </Button>
        </div>
      </header>

      {/* ─── MAIN BUILDER BODY ─────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PALETTE & LAYERS PANEL */}
        {!previewMode && (
          <aside className="w-72 shrink-0 border-r border-white/10 bg-slate-900/95 flex flex-col h-full overflow-hidden text-white">
            {/* Mode switch tabs */}
            <div className="grid grid-cols-2 p-2 border-b border-white/10 bg-slate-950/40 gap-1">
              <button
                type="button"
                onClick={() => setLeftTab("widgets")}
                className={`py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                  leftTab === "widgets" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Components
              </button>
              <button
                type="button"
                onClick={() => setLeftTab("layers")}
                className={`py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                  leftTab === "layers" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                Structure
              </button>
            </div>

            {leftTab === "widgets" ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search */}
                <div className="p-3 border-b border-white/10">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search components..."
                      value={componentSearch}
                      onChange={(e) => setComponentSearch(e.target.value)}
                      className="pl-8 bg-secondary/40 border-white/10 text-xs h-8 text-white"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="flex items-center gap-1 p-2 overflow-x-auto border-b border-white/10 no-scrollbar">
                  {COMPONENT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setComponentCategory(cat.id)}
                      className={`px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap transition-colors ${
                        componentCategory === cat.id
                          ? "bg-white/15 text-white"
                          : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Components Palette Grid */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {filteredComponents.map((comp) => {
                      const Icon = comp.icon;
                      return (
                        <button
                          key={comp.type}
                          type="button"
                          onClick={() => {
                            // If a section is selected, insert there; otherwise into last section or create section
                            if (selection?.type === "section") {
                              handleAddBlock(selection.sectionId, comp.type);
                            } else if (page.sections && page.sections.length > 0) {
                              const lastSec = page.sections[page.sections.length - 1];
                              if (lastSec) handleAddBlock(lastSec.id, comp.type);
                            } else {
                              handleAddSection();
                            }
                          }}
                          className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 bg-secondary/20 hover:border-primary/50 hover:bg-secondary/40 transition-all text-center group cursor-pointer"
                        >
                          <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-1.5">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-[11px] font-bold text-white leading-tight">{comp.title}</span>
                          <span className="text-[9px] text-muted-foreground line-clamp-1 mt-0.5">
                            {comp.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* STRUCTURE / LAYERS TREE */
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                  Page Sections ({page.sections?.length || 0})
                </div>
                {(page.sections || []).map((sec: any, sIdx: number) => {
                  const isSecSelected = selection?.type === "section" && selection.sectionId === sec.id;
                  return (
                    <div key={sec.id} className="rounded-lg border border-white/10 bg-secondary/20 overflow-hidden">
                      <div
                        onClick={() => setSelection({ type: "section", sectionId: sec.id })}
                        className={`flex items-center justify-between p-2 text-xs font-bold cursor-pointer transition-colors ${
                          isSecSelected ? "bg-primary/20 text-primary border-l-2 border-primary" : "hover:bg-white/5"
                        }`}
                      >
                        <span className="truncate">{sec.name || `Section ${sIdx + 1}`}</span>
                        <span className="text-[10px] text-muted-foreground">{sec.blocks?.length || 0} blocks</span>
                      </div>

                      {/* Blocks list inside section */}
                      <div className="pl-3 pr-1 py-1 space-y-1 bg-slate-950/40">
                        {(sec.blocks || []).map((blk: any) => {
                          const isBlkSelected =
                            selection?.type === "block" &&
                            selection.sectionId === sec.id &&
                            selection.blockId === blk.id;
                          return (
                            <div
                              key={blk.id}
                              onClick={() => setSelection({ type: "block", sectionId: sec.id, blockId: blk.id })}
                              className={`flex items-center justify-between px-2 py-1 rounded text-[11px] cursor-pointer ${
                                isBlkSelected ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                              }`}
                            >
                              <span className="truncate">{blk.blockType?.name || blk.blockType?.type || "Block"}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-muted-foreground hover:text-rose-400 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteBlock(sec.id, blk.id);
                                }}
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-bold border-dashed border-white/20 mt-2"
                  onClick={() => handleAddSection()}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Section
                </Button>
              </div>
            )}
          </aside>
        )}

        {/* CENTER VISUAL CANVAS */}
        <VisualCanvas
          page={page}
          device={device}
          selection={selection}
          onSelectBlock={(sectionId, blockId) => setSelection({ type: "block", sectionId, blockId })}
          onSelectSection={(sectionId) => setSelection({ type: "section", sectionId })}
          onAddSection={handleAddSection}
          onMoveSection={handleMoveSection}
          onDuplicateSection={handleDuplicateSection}
          onDeleteSection={handleDeleteSection}
          onAddBlock={handleAddBlock}
          onMoveBlock={handleMoveBlock}
          onDuplicateBlock={handleDuplicateBlock}
          onDeleteBlock={handleDeleteBlock}
          previewMode={previewMode}
        />

        {/* RIGHT INSPECTOR PANEL */}
        {!previewMode && (
          <RightInspector
            selection={selection}
            page={page}
            onUpdateBlockProps={handleUpdateBlockProps}
            onUpdateBlockStyle={handleUpdateBlockStyle}
            onUpdateBlockResponsive={handleUpdateBlockResponsive}
            onUpdateSection={handleUpdateSection}
            onUpdatePageMeta={handleUpdatePageMeta}
            onDuplicateBlock={handleDuplicateBlock}
            onDeleteBlock={handleDeleteBlock}
            onDuplicateSection={handleDuplicateSection}
            onDeleteSection={handleDeleteSection}
            onClose={() => setSelection(null)}
          />
        )}
      </div>

      {/* ─── PUBLISH VALIDATION MODAL ───────────────────────────────────────── */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="max-w-md glass-panel border-white/10 bg-slate-900/95 text-white p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Publish Page to Live Website
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 bg-secondary/30 rounded-lg border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Title:</span>
                <span className="font-bold text-white">{page.title}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Live URL:</span>
                <span className="font-mono text-primary font-semibold">/pages/{page.slug}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Sections:</span>
                <span className="font-semibold">{page.sections?.length || 0} sections</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Release Notes (Optional)</label>
              <Input
                value={publishNotes}
                onChange={(e) => setPublishNotes(e.target.value)}
                placeholder="e.g. Updated Cadet prep curriculum and airline logos"
                className="bg-secondary/40 border-white/10 text-xs text-white"
              />
            </div>

            <p className="text-[11px] text-muted-foreground">
              Publishing will update the live production page and trigger website cache revalidation.
            </p>
          </div>

          <DialogFooter className="border-t border-white/10 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPublishDialogOpen(false)}
              className="border-white/10 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending}
              className="bg-primary text-white hover:bg-primary/90 text-xs font-bold"
            >
              {publishMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
              Confirm & Publish Live
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── VERSION HISTORY DRAWER ─────────────────────────────────────────── */}
      <Dialog open={versionsDrawerOpen} onOpenChange={setVersionsDrawerOpen}>
        <DialogContent className="max-w-lg glass-panel border-white/10 bg-slate-900/95 text-white p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              Revision History & Rollback
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto space-y-2 py-2">
            {versions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                No past published versions recorded yet.
              </p>
            ) : (
              versions.map((ver) => (
                <div
                  key={ver.id}
                  className="p-3 rounded-lg border border-white/10 bg-secondary/30 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">Version {ver.version}</span>
                      <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-400">
                        {ver.status}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(ver.createdAt).toLocaleString()} {ver.creator ? `by ${ver.creator.name}` : ""}
                    </p>
                    {ver.notes && <p className="text-[11px] text-slate-300 italic mt-1">"{ver.notes}"</p>}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs font-semibold border-white/10"
                    onClick={() => handleRollbackVersion(ver.version)}
                  >
                    Restore
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
