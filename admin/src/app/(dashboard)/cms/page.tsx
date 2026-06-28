"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Globe, FileText, HelpCircle, Plane, Building2, ImageIcon, Megaphone, 
  Search, Plus, Eye, CheckCircle2, Edit2, SlidersHorizontal, Sparkles, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/use-toast";

const MOCK_PAGES = [
  { id: 1, title: "Academy Homepage", slug: "/", lastModified: "2 hours ago", status: "LIVE", views: "14,289", author: "Super Admin" },
  { id: 2, title: "About Us & Vision", slug: "/about", lastModified: "3 days ago", status: "LIVE", views: "3,120", author: "Content Team" },
  { id: 3, title: "Cadet Pilot Program (Indigo/AI)", slug: "/courses/cadet-preparation", lastModified: "Yesterday", status: "LIVE", views: "8,940", author: "Marketing Team" },
  { id: 4, title: "Airborne Fleet & Tech", slug: "/fleet", lastModified: "5 days ago", status: "DRAFT", views: "—", author: "Super Admin" },
  { id: 5, title: "Winter Intake Landing Page", slug: "/intake-2026", lastModified: "1 week ago", status: "SCHEDULED", views: "—", author: "Marketing Team" },
];

const MOCK_FAQS = [
  { id: 1, question: "What is the minimum age to enroll in the DGCA CPL Ground School?", answer: "Candidates must be at least 17 years of age and have completed 10+2 with Physics and Mathematics.", category: "General Eligibility", status: "LIVE" },
  { id: 2, question: "Does Airborne guarantee placement with Indigo or Air India?", answer: "We have dedicated placement cells and screening drives with Indigo, Air India, and Akasa. Over 88% of our cadets successfully clear the airline selection process.", category: "Placements", status: "LIVE" },
  { id: 3, question: "Are accommodation and hostel facilities available at Delhi Campus?", answer: "Yes, fully furnished air-conditioned cadet housing is available within 15 minutes of our simulator training bay.", category: "Campus Facilities", status: "DRAFT" },
];

const MOCK_FLEET = [
  { id: 1, model: "Cessna 172 Skyhawk (Garmin G1000)", type: "Single Engine Trainer", count: 12, base: "Delhi / Aligarh Flight Line", status: "LIVE" },
  { id: 2, model: "Piper PA-34 Seneca V", type: "Multi Engine Instrument Trainer", count: 4, base: "Delhi / Aligarh Flight Line", status: "LIVE" },
  { id: 3, model: "Airbus A320 Full Flight Simulator", type: "Level D Simulator Bay", count: 2, base: "Delhi Simulator Operations HQ", status: "LIVE" },
];

const MOCK_CAMPUS = [
  { id: 1, facility: "Full Flight Simulator Bay", description: "Equipped with state-of-the-art A320 and B737 fixed-base and full motion training devices.", location: "Delhi Simulator Operations HQ", status: "LIVE" },
  { id: 2, facility: "Advanced DGCA Ground Navigation Labs", description: "Smart classrooms featuring interactive visualizer panels and real-time weather radar feeds.", location: "Delhi Main Campus", status: "LIVE" },
  { id: 3, facility: "Cadet Residential Complex", description: "Air-conditioned premium housing with dedicated study lounges and aviation library.", location: "South Delhi Annex", status: "LIVE" },
];

export default function CMSPage() {
  const [activeTab, setActiveTab] = React.useState("pages");
  const [previewMode, setPreviewMode] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [editItem, setEditItem] = React.useState<any | null>(null);

  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Content Saved to CMS", description: "Website CDN and static generation cache invalidated successfully." });
    setEditItem(null);
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Website CMS Editor" 
        description="Global command over public landing pages, FAQs, fleet showcase, campus facilities, gallery, and news bulletins." 
        action={
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setPreviewMode(!previewMode);
                toast({ title: `Preview Mode ${!previewMode ? "Activated" : "Deactivated"}`, description: !previewMode ? "Simulating live production Next.js frontend rendering." : "Returning to CMS edit layout." });
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                previewMode ? "bg-amber-500 text-slate-900 border-amber-600 shadow-lg shadow-amber-500/20 animate-pulse" : "bg-secondary/60 text-muted-foreground hover:text-white border-white/10"
              }`}
            >
              <Eye className="h-4 w-4" />
              <span>{previewMode ? "Exit Live Preview" : "Real-Time Preview Mode"}</span>
            </button>
            <Button onClick={() => setEditItem({ title: "New Custom Page", slug: "/new-page", status: "DRAFT" })} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105">
              <Plus className="h-4 w-4 mr-2" />
              Create New Entry
            </Button>
          </div>
        }
      />

      {/* Real-Time Preview Notice Banner */}
      {previewMode && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-primary/10 to-blue-600/20 border border-amber-500/30 flex items-center justify-between shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-slate-900 font-bold shadow-lg shadow-amber-500/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Interactive Public Web Preview Mode</h3>
              <p className="text-xs text-muted-foreground mt-0.5">You are currently inspecting live headless CMS draft contents. Edits will sync instantly to the preview iframe.</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setPreviewMode(false)} className="bg-slate-900 hover:bg-slate-800 text-white border border-white/10 text-xs font-bold">
            Exit Preview
          </Button>
        </motion.div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1">
        {[
          { id: "pages", label: "Core Web Pages", icon: Globe },
          { id: "faqs", label: "Knowledgebase FAQs", icon: HelpCircle },
          { id: "fleet", label: "Fleet Information", icon: Plane },
          { id: "campus", label: "Campus Facilities", icon: Building2 },
          { id: "gallery", label: "Public Media Gallery", icon: ImageIcon },
          { id: "news", label: "News & Announcements", icon: Megaphone },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

      <AnimatePresence mode="wait">
        {activeTab === "pages" && (
          <motion.div key="pages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" /> Global Public Pages Directory
                </h3>
                <Input placeholder="Search public landing pages..." className="bg-secondary/40 border-white/10 text-xs font-semibold w-64" />
              </div>

              <div className="space-y-3 pt-2">
                {MOCK_PAGES.map((pg) => (
                  <div key={pg.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30 font-bold text-sm">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white truncate">{pg.title}</p>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${pg.status === "LIVE" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : pg.status === "SCHEDULED" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}`}>
                            {pg.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Route Slug: <span className="font-mono text-white font-medium">{pg.slug}</span> • Last Updated: {pg.lastModified} • Maintained by {pg.author}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-lg border border-white/5 hidden sm:inline-block">
                        {pg.views} views
                      </span>
                      <Button size="sm" onClick={() => setEditItem(pg)} className="bg-primary/20 hover:bg-primary/30 text-white border border-primary/30 text-xs font-bold py-1 px-3 h-8">
                        <Edit2 className="h-3 w-3 mr-1.5" /> Edit CMS Data
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "faqs" && (
          <motion.div key="faqs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" /> Frequently Asked Questions (FAQ) Manager
                </h3>
                <Button size="sm" onClick={() => setEditItem({ question: "New Custom FAQ Question?", answer: "Standard answer contents...", status: "DRAFT" })} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold py-1 px-3 h-8">
                  <Plus className="h-3 w-3 mr-1" /> Add FAQ Entry
                </Button>
              </div>

              <div className="space-y-4 pt-2">
                {MOCK_FAQS.map((fq) => (
                  <div key={fq.id} className="p-5 rounded-2xl bg-secondary/30 border border-white/5 space-y-3 hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full">
                        {fq.category}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${fq.status === "LIVE" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}`}>
                          {fq.status}
                        </span>
                        <Button size="sm" onClick={() => setEditItem(fq)} variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-white">
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-white tracking-tight">{fq.question}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">{fq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "fleet" && (
          <motion.div key="fleet" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plane className="h-5 w-5 text-primary" /> Airborne Academy Fleet Showcase
                </h3>
                <Button size="sm" onClick={() => setEditItem({ model: "New Aircraft Trainer", type: "Flight Line", status: "DRAFT" })} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold py-1 px-3 h-8">
                  <Plus className="h-3 w-3 mr-1" /> Add Aircraft / Sim
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {MOCK_FLEET.map((fl) => (
                  <div key={fl.id} className="glass-card rounded-2xl p-5 border border-white/5 space-y-4 hover:border-white/10 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <span className="text-xs font-bold text-muted-foreground">{fl.type}</span>
                        <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          {fl.status}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white tracking-tight mt-3">{fl.model}</h4>
                      <div className="mt-4 p-3 rounded-xl bg-secondary/30 border border-white/5 text-center">
                        <span className="text-[10px] font-bold text-muted-foreground block uppercase">Active Units</span>
                        <span className="text-xl font-extrabold text-white mt-0.5 block">{fl.count} Aircraft</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-muted-foreground font-semibold">
                      <span>Base: {fl.base}</span>
                      <Button size="sm" onClick={() => setEditItem(fl)} variant="ghost" className="h-7 w-7 p-0 text-primary hover:text-white">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "campus" && (
          <motion.div key="campus" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" /> Campus Facilities & Amenities
                </h3>
                <Button size="sm" onClick={() => setEditItem({ facility: "New Facility Structure", description: "Facility details...", status: "DRAFT" })} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold py-1 px-3 h-8">
                  <Plus className="h-3 w-3 mr-1" /> Add Facility Entry
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {MOCK_CAMPUS.map((cp) => (
                  <div key={cp.id} className="glass-card rounded-2xl p-5 border border-white/5 space-y-4 hover:border-white/10 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <span className="text-xs font-bold text-muted-foreground">{cp.location}</span>
                        <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          {cp.status}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white tracking-tight mt-3">{cp.facility}</h4>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-medium">{cp.description}</p>
                    </div>
                    <div className="flex items-center justify-end pt-4 border-t border-white/5">
                      <Button size="sm" onClick={() => setEditItem(cp)} variant="ghost" className="h-7 text-xs font-bold text-primary hover:text-white">
                        <Edit2 className="h-3 w-3 mr-1.5" /> Edit Information
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "gallery" && (
          <motion.div key="gallery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6 text-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-primary border border-primary/30 mx-auto shadow-xl">
                <ImageIcon className="h-8 w-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-white tracking-tight">Media Gallery Cloud Synchronizer</h3>
                <p className="text-xs text-muted-foreground">The public gallery is currently linked to the Media Library microservice. You can upload high-resolution fleet and campus photos directly via the Media module.</p>
              </div>
              <Button asChild className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
                <a href="/media">Open Media Library →</a>
              </Button>
            </div>
          </motion.div>
        )}

        {activeTab === "news" && (
          <motion.div key="news" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6 text-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mx-auto shadow-xl">
                <Megaphone className="h-8 w-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-white tracking-tight">News & Public Announcements Bulletin</h3>
                <p className="text-xs text-muted-foreground">Manage press releases, DGCA exam top ranker announcements, and cadet intake alerts via the unified Blog & Resources microservice.</p>
              </div>
              <Button asChild className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
                <a href="/blog">Open Blog & Resources Module →</a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Content Modal */}
      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent className="max-w-xl glass-panel border-white/10 bg-slate-900/95">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-primary" />
              Edit CMS Static Contents
            </DialogTitle>
          </DialogHeader>
          {editItem && (
            <form onSubmit={handleSaveContent} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Content Display Title / Question / Header *</label>
                <Input defaultValue={editItem.title || editItem.question || editItem.model || editItem.facility} required className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" />
              </div>
              {editItem.slug && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Public URL Slug *</label>
                  <Input defaultValue={editItem.slug} required className="bg-secondary/40 border-white/10 text-xs font-mono text-primary font-bold" />
                </div>
              )}
              {editItem.answer && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">FAQ Answer Content</label>
                  <Textarea defaultValue={editItem.answer} rows={4} className="bg-secondary/40 border-white/10 text-xs font-medium text-white leading-relaxed" />
                </div>
              )}
              {editItem.description && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Facility Description</label>
                  <Textarea defaultValue={editItem.description} rows={4} className="bg-secondary/40 border-white/10 text-xs font-medium text-white leading-relaxed" />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Publishing Status</label>
                <select className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/60 px-3 py-1 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                  <option value="LIVE" className="bg-slate-900 text-emerald-400">LIVE (PUBLISHED TO CDN)</option>
                  <option value="DRAFT" className="bg-slate-900 text-amber-400">DRAFT (STAGING ONLY)</option>
                  <option value="SCHEDULED" className="bg-slate-900 text-blue-400">SCHEDULED PUBLICATION</option>
                </select>
              </div>
              <DialogFooter className="pt-4 border-t border-white/10">
                <Button type="button" variant="outline" onClick={() => setEditItem(null)} className="border-white/10 hover:bg-white/5 text-xs font-bold">Cancel</Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
                  Save & Invalidate CDN Cache
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
