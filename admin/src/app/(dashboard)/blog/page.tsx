"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, BookOpen, Megaphone, Search, Plus, Edit2, 
  User, SearchCode, Bookmark, Trash2, Loader2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

interface Resource {
  id: string;
  title: string;
  slug: string;
  description?: string;
  type: string;
  status: string;
  category?: string;
  seoTitle?: string;
  seoDesc?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  downloadCount?: number;
}

interface ResourcesResponse {
  items: Resource[];
  total: number;
}

export default function BlogPage() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = React.useState("ALL");
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [editingPost, setEditingPost] = React.useState<Partial<Resource> | null>(null);
  const [postTab, setPostTab] = React.useState("content");

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Query resources of type DOCUMENT
  const { data, isLoading } = useQuery<ResourcesResponse>({
    queryKey: ["resources", "blog", debouncedSearch, activeCategory],
    queryFn: async () => {
      const p = new URLSearchParams({
        page: "1",
        limit: "100",
        type: "DOCUMENT",
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(activeCategory !== "ALL" ? { category: activeCategory } : {}),
      });
      return apiFetch<ResourcesResponse>(`/resources?${p}`);
    },
  });

  const articles = data?.items ?? [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (body: Partial<Resource>) => 
      apiFetch<Resource>("/resources", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      toast({ title: "Article Created", description: "The new article has been added to the database." });
      setEditingPost(null);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Resource> }) => 
      apiFetch<Resource>(`/resources/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      toast({ title: "Article Saved", description: "CMS resource updated successfully." });
      setEditingPost(null);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => 
      apiFetch<void>(`/resources/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      toast({ title: "Article Deleted", description: "The article has been permanently removed." });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    const body: Partial<Resource> = {
      title: editingPost.title || "",
      slug: editingPost.slug || editingPost.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") || "article",
      description: editingPost.description || "",
      type: "DOCUMENT",
      category: editingPost.category || "Aviation Articles",
      status: editingPost.status || "DRAFT",
      seoTitle: editingPost.seoTitle || editingPost.title,
      seoDesc: editingPost.seoDesc || editingPost.description?.substring(0, 150),
      metadata: {
        author: editingPost.metadata?.author || "Flight Content Desk",
      },
    };

    if (editingPost.id) {
      updateMutation.mutate({ id: editingPost.id, body });
    } else {
      createMutation.mutate(body);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Blog & Academic Resources" 
        description="Write and publish expert aviation articles, high-ranking DGCA exam study guides, and official press releases with integrated SEO attribution." 
        action={
          <Button onClick={() => { setEditingPost({ title: "", category: "Aviation Articles", slug: "", status: "DRAFT", metadata: { author: "Flight Content Desk" } }); setPostTab("content"); }} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105">
            <Plus className="h-4 w-4 mr-2" />
            Write New Article
          </Button>
        }
      />

      {/* Categories Filter Tabs */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1">
        {[
          { id: "ALL", label: "All Published & Drafts", icon: Bookmark },
          { id: "Aviation Articles", label: "Aviation Articles", icon: FileText },
          { id: "DGCA Exam Guides", label: "DGCA Exam Guides", icon: BookOpen },
          { id: "Press Releases", label: "Press Releases", icon: Megaphone },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                isActive ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-white/5 hover:text-foreground border-transparent"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-muted-foreground"}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search articles by title, author, topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary/40 border-white/10 focus:border-primary text-sm font-medium text-white"
          />
        </div>
        <span className="text-xs font-bold text-muted-foreground hidden sm:block">
          {articles.length} matching resources
        </span>
      </div>

      {/* Article Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 space-y-4">
              <Skeleton className="h-6 w-24 bg-white/5" />
              <Skeleton className="h-8 w-full bg-white/5" />
              <Skeleton className="h-20 w-full bg-white/5" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No articles found in database. Write a new article to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((art) => (
            <div key={art.id} className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between group hover:border-white/20 transition-all">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-xs font-extrabold bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full">
                    {art.category || "Aviation Articles"}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${art.status === "PUBLISHED" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : art.status === "SCHEDULED" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}`}>
                    {art.status}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight mt-4 group-hover:text-primary transition-colors">{art.title}</h3>
                <p className="text-xs text-muted-foreground font-mono mt-1">/{art.slug}</p>

                <div className="grid grid-cols-2 gap-4 my-6">
                  <div className="p-3 rounded-xl bg-secondary/30 border border-white/5 text-center">
                    <span className="text-[10px] font-bold text-muted-foreground block uppercase">Downloads/Reads</span>
                    <span className="text-lg font-bold text-white mt-0.5 block">{art.downloadCount ?? 0}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/30 border border-white/5 text-center">
                    <span className="text-[10px] font-bold text-muted-foreground block uppercase">Created</span>
                    <span className="text-sm font-bold text-primary mt-1.5 block">{formatDate(art.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-muted-foreground font-semibold">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span>{art.metadata?.author || "Flight Content Desk"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => { setEditingPost(art); setPostTab("content"); }} className="bg-primary/20 hover:bg-primary/30 text-white border border-primary/30 text-xs font-bold py-1 px-3 h-8">
                    <Edit2 className="h-3 w-3 mr-1.5" /> Edit
                  </Button>
                  <Button size="sm" onClick={() => { if(confirm("Are you sure?")) deleteMutation.mutate(art.id); }} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold py-1 px-3 h-8">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article Editor / SEO Manager Modal */}
      <Dialog open={!!editingPost} onOpenChange={(o) => !o && setEditingPost(null)}>
        <DialogContent className="max-w-4xl glass-panel border-white/10 bg-slate-900/95 p-0 overflow-hidden text-white">
          <DialogHeader className="p-6 border-b border-white/10 bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  {editingPost?.id ? `Edit: ${editingPost?.title}` : "Write New Article"}
                </DialogTitle>
              </div>
              <span className="text-xs font-extrabold bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full">
                {editingPost?.status || "DRAFT"}
              </span>
            </div>

            {/* Sub Tabs */}
            <div className="flex gap-2 pt-4 border-t border-white/10 mt-4">
              {[
                { id: "content", label: "Article Content Editor", icon: FileText },
                { id: "seo", label: "Search Engine Optimization (SEO)", icon: SearchCode },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = postTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPostTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                      isActive ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-secondary/40 text-muted-foreground hover:bg-white/5 hover:text-white border-white/5"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-primary"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </DialogHeader>

          <form onSubmit={handleSavePost} id="article-form" className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
            <AnimatePresence mode="wait">
              {postTab === "content" && (
                <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Article Headline *</label>
                    <Input 
                      value={editingPost?.title || ""} 
                      onChange={(e) => setEditingPost(prev => ({ ...prev, title: e.target.value }))}
                      required 
                      className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">URL Slug *</label>
                      <Input 
                        value={editingPost?.slug || ""} 
                        onChange={(e) => setEditingPost(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-") }))}
                        placeholder="e.g. cpl-exam-guide"
                        required 
                        className="bg-secondary/40 border-white/10 text-xs text-primary font-bold" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">Resource Category</label>
                      <select 
                        value={editingPost?.category || "Aviation Articles"}
                        onChange={(e) => setEditingPost(prev => ({ ...prev, category: e.target.value }))}
                        className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/60 px-3 py-1 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      >
                        <option value="Aviation Articles" className="bg-slate-900">Aviation Articles</option>
                        <option value="DGCA Exam Guides" className="bg-slate-900">DGCA Exam Guides</option>
                        <option value="Press Releases" className="bg-slate-900">Press Releases</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Main Body Contents (Markdown / Rich HTML Supported)</label>
                    <Textarea 
                      value={editingPost?.description || ""} 
                      onChange={(e) => setEditingPost(prev => ({ ...prev, description: e.target.value }))}
                      rows={12} 
                      className="bg-secondary/40 border-white/10 text-xs font-medium text-white leading-relaxed" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Publishing Lifecycle Status</label>
                    <select 
                      value={editingPost?.status || "DRAFT"}
                      onChange={(e) => setEditingPost(prev => ({ ...prev, status: e.target.value }))}
                      className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/60 px-3 py-1 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    >
                      <option value="DRAFT" className="bg-slate-900 text-amber-400">DRAFT (IN PROGRESS)</option>
                      <option value="PUBLISHED" className="bg-slate-900 text-emerald-400">PUBLISHED (LIVE ON CMS)</option>
                      <option value="SCHEDULED" className="bg-slate-900 text-blue-400">SCHEDULED PUBLICATION</option>
                      <option value="ARCHIVED" className="bg-slate-900 text-muted-foreground">ARCHIVED</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {postTab === "seo" && (
                <motion.div key="seo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3">Public Search Engine Optimization & Graph Metadata</h3>
                  <div className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">Author Attribution Name</label>
                      <Input 
                        value={editingPost?.metadata?.author || ""} 
                        onChange={(e) => setEditingPost(prev => prev ? ({ ...prev, metadata: { ...prev.metadata, author: e.target.value } }) : null)}
                        className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">SEO Meta Title tag</label>
                      <Input 
                        value={editingPost?.seoTitle || ""} 
                        onChange={(e) => setEditingPost(prev => ({ ...prev, seoTitle: e.target.value }))}
                        className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">SEO Meta Description tag</label>
                      <Textarea 
                        value={editingPost?.seoDesc || ""} 
                        onChange={(e) => setEditingPost(prev => ({ ...prev, seoDesc: e.target.value }))}
                        rows={4} 
                        className="bg-secondary/40 border-white/10 text-xs font-medium text-white leading-relaxed" 
                      />
                    </div>
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
                      <span className="text-xs font-bold text-white block">Search Engine Snippet Preview</span>
                      <p className="text-[11px] text-primary underline truncate">{`https://www.airborneaviation.in/blog/${editingPost?.slug || "url-slug"}`}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{editingPost?.seoDesc || "Meta description details will render here."}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <DialogFooter className="p-6 border-t border-white/10 bg-slate-900/80">
            <Button type="button" variant="outline" onClick={() => setEditingPost(null)} className="border-white/10 hover:bg-white/5 text-xs font-bold">Cancel</Button>
            <Button 
              type="submit" 
              form="article-form" 
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20"
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                "Save Article & Sync CMS Index"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
