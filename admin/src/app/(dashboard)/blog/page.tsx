"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, BookOpen, Megaphone, Globe, Search, Plus, Edit2, 
  Calendar, User, Eye, CheckCircle2, SlidersHorizontal, SearchCode, Bookmark
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/use-toast";

const ARTICLES = [
  { id: 1, title: "How to Clear DGCA CPL Exams on the First Attempt", category: "DGCA Exam Guides", slug: "clear-dgca-cpl-first-attempt", author: "Capt. Vikram Singh", publishDate: "June 24, 2026", status: "PUBLISHED", views: "4,120", reads: "89%", seoTitle: "Clear DGCA CPL Exams First Attempt | Airborne Aviation", seoDesc: "Master the DGCA CPL ground papers with expert tips from Capt. Vikram Singh. Covers Air Navigation, Meteorology, and Air Regulations." },
  { id: 2, title: "The Future of Aviation in India: Indigo & Air India Mega Orders", category: "Aviation Articles", slug: "future-aviation-india-mega-orders", author: "Aviation Analyst Desk", publishDate: "June 18, 2026", status: "PUBLISHED", views: "6,480", reads: "94%", seoTitle: "Future of Aviation in India | Airline Mega Orders", seoDesc: "Explore the career impact of record-breaking aircraft orders by Indigo, Air India, and Akasa Air on commercial pilot demand." },
  { id: 3, title: "Airborne Aviation Academy Adds 4 New Multi-Engine Trainers", category: "Press Releases", slug: "academy-adds-new-multi-engine-trainers", author: "Academy PR Cell", publishDate: "July 05, 2026", status: "SCHEDULED", views: "—", reads: "—", seoTitle: "Airborne Aviation Adds 4 Multi-Engine Trainers", seoDesc: "Airborne Aviation Academy expands its flight training fleet with 4 new Piper Seneca V multi-engine instrument trainers at Delhi base." },
  { id: 4, title: "Understanding Advanced Weather Radar & Meteorology Charts", category: "DGCA Exam Guides", slug: "advanced-weather-radar-meteorology", author: "Capt. Anjali Sharma", publishDate: "June 10, 2026", status: "DRAFT", views: "—", reads: "—", seoTitle: "Weather Radar & Aviation Meteorology | DGCA Exam Guide", seoDesc: "Comprehensive study material and guide for decoding aviation weather charts, METAR, TAF, and SIGMET for DGCA exams." },
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = React.useState("ALL");
  const [search, setSearch] = React.useState("");
  const [editingPost, setEditingPost] = React.useState<any | null>(null);
  const [postTab, setPostTab] = React.useState("content");

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Article Saved Successfully", description: "CMS blog collection updated and search index rebuilt." });
    setEditingPost(null);
  };

  const filteredArticles = ARTICLES.filter((a) => {
    const matchCat = activeCategory === "ALL" || a.category === activeCategory;
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.author.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Blog & Academic Resources" 
        description="Write and publish expert aviation articles, high-ranking DGCA exam study guides, and official press releases with integrated SEO attribution." 
        action={
          <Button onClick={() => { setEditingPost({ title: "New Aviation Article", category: "Aviation Articles", slug: "new-aviation-article", author: "Flight Content Desk", status: "DRAFT" }); setPostTab("content"); }} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105">
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
            className="pl-9 bg-secondary/40 border-white/10 focus:border-primary text-sm font-medium"
          />
        </div>
        <span className="text-xs font-bold text-muted-foreground hidden sm:block">
          {filteredArticles.length} matching resources
        </span>
      </div>

      {/* Article Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.map((art) => (
          <div key={art.id} className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between group hover:border-white/20 transition-all">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs font-extrabold bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full">
                  {art.category}
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${art.status === "PUBLISHED" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : art.status === "SCHEDULED" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}`}>
                  {art.status}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white tracking-tight mt-4 group-hover:text-primary transition-colors">{art.title}</h3>
              <p className="text-xs text-muted-foreground font-mono mt-1">/{art.slug}</p>

              <div className="grid grid-cols-2 gap-4 my-6">
                <div className="p-3 rounded-xl bg-secondary/30 border border-white/5 text-center">
                  <span className="text-[10px] font-bold text-muted-foreground block uppercase">Total Pageviews</span>
                  <span className="text-lg font-bold text-white mt-0.5 block">{art.views}</span>
                </div>
                <div className="p-3 rounded-xl bg-secondary/30 border border-white/5 text-center">
                  <span className="text-[10px] font-bold text-muted-foreground block uppercase">Read Completion Rate</span>
                  <span className="text-lg font-bold text-primary mt-0.5 block">{art.reads}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-muted-foreground font-semibold">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-primary" />
                <span>{art.author} • {art.publishDate}</span>
              </div>
              <Button size="sm" onClick={() => { setEditingPost(art); setPostTab("content"); }} className="bg-primary/20 hover:bg-primary/30 text-white border border-primary/30 text-xs font-bold py-1 px-3 h-8">
                <Edit2 className="h-3 w-3 mr-1.5" /> Edit Resource
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Article Editor / SEO Manager Modal */}
      <Dialog open={!!editingPost} onOpenChange={(o) => !o && setEditingPost(null)}>
        <DialogContent className="max-w-4xl glass-panel border-white/10 bg-slate-900/95 p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-white/10 bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  {editingPost?.title}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Category: <span className="text-white font-semibold">{editingPost?.category}</span> • Author Attribution: <span className="font-semibold text-primary">{editingPost?.author}</span>
                </p>
              </div>
              <span className="text-xs font-extrabold bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full">
                {editingPost?.status}
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

          <form onSubmit={handleSavePost} id="article-form" className="p-6 overflow-y-auto max-h-[60vh]">
            <AnimatePresence mode="wait">
              {postTab === "content" && (
                <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Article Headline *</label>
                    <Input defaultValue={editingPost?.title} required className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">URL Slug *</label>
                      <Input defaultValue={editingPost?.slug} required className="bg-secondary/40 border-white/10 text-xs font-mono text-primary font-bold" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">Resource Category</label>
                      <select className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/60 px-3 py-1 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                        <option value="Aviation Articles" className="bg-slate-900">Aviation Articles</option>
                        <option value="DGCA Exam Guides" className="bg-slate-900">DGCA Exam Guides</option>
                        <option value="Press Releases" className="bg-slate-900">Press Releases</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Main Body Contents (Markdown / Rich HTML Supported)</label>
                    <Textarea defaultValue={`# Introduction to ${editingPost?.title}\n\nWrite exhaustive study material, expert aviation guidance, and professional insights here. Use standard headings, bold typography, and inline links to maximize student engagement and retention.`} rows={12} className="bg-secondary/40 border-white/10 text-xs font-medium text-white leading-relaxed" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Publishing Lifecycle Status</label>
                    <select className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/60 px-3 py-1 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                      <option value="PUBLISHED" className="bg-slate-900 text-emerald-400">PUBLISHED (LIVE ON CMS)</option>
                      <option value="DRAFT" className="bg-slate-900 text-amber-400">DRAFT (IN PROGRESS)</option>
                      <option value="SCHEDULED" className="bg-slate-900 text-blue-400">SCHEDULED PUBLICATION</option>
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
                      <Input defaultValue={editingPost?.author} className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">SEO Meta Title tag</label>
                      <Input defaultValue={editingPost?.seoTitle ?? `${editingPost?.title} | Airborne Aviation Academy`} className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">SEO Meta Description tag</label>
                      <Textarea defaultValue={editingPost?.seoDesc ?? `Read ${editingPost?.title} written by expert flight instructors at Airborne Aviation Academy.`} rows={4} className="bg-secondary/40 border-white/10 text-xs font-medium text-white leading-relaxed" />
                    </div>
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
                      <span className="text-xs font-bold text-white block">Search Engine Snippet Preview</span>
                      <p className="text-[11px] text-primary underline truncate">{`https://airborneaviation.academy/blog/${editingPost?.slug}`}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{editingPost?.seoDesc ?? `Read ${editingPost?.title} written by expert flight instructors at Airborne Aviation Academy.`}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <DialogFooter className="p-6 border-t border-white/10 bg-slate-900/80">
            <Button type="button" variant="outline" onClick={() => setEditingPost(null)} className="border-white/10 hover:bg-white/5 text-xs font-bold">Cancel</Button>
            <Button type="submit" form="article-form" className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
              Save Article & Sync CMS Index
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
