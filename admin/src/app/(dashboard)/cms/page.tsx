"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Globe, FileText, ImageIcon, Megaphone, LayoutTemplate,
  Search, Plus, Eye, Edit2, Loader2, AlertCircle,
  MoreHorizontal, Archive, CalendarClock, Clock, Menu,
  Sparkles, ExternalLink, Settings2, GitBranch,
  Smartphone, Tablet, Monitor, Copy, Check, RefreshCw,
  Layers, BookOpen, ShieldCheck, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NavMenuEditor } from "@/components/cms/nav-menu-editor";

const PAGE_TRANSITIONS: Record<string, PageModel["status"][]> = {
  DRAFT: ["PUBLISHED", "SCHEDULED", "ARCHIVED"],
  SCHEDULED: ["DRAFT", "PUBLISHED", "ARCHIVED"],
  PUBLISHED: ["DRAFT", "ARCHIVED"],
  ARCHIVED: ["DRAFT"],
};

const TRANSITION_META: Record<PageModel["status"], { label: string; icon: typeof Globe }> = {
  PUBLISHED: { label: "Publish", icon: Globe },
  SCHEDULED: { label: "Schedule", icon: CalendarClock },
  DRAFT: { label: "Unpublish (to Draft)", icon: Clock },
  ARCHIVED: { label: "Archive", icon: Archive },
};

interface PageModel {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
  seoTitle: string | null;
  seoDesc: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: { name: string };
  publisher?: { name: string };
  version: number;
}

// Modular Block Definitions for Pages CMS with one-click copyable YAML
const MODULAR_BLOCK_TEMPLATES = [
  {
    id: "hero",
    title: "Hero Banner",
    badge: "Header & Call to Action",
    description: "High-impact opening section with title, badge, subtitle, and primary call-to-action button.",
    icon: Sparkles,
    yaml: `- type: hero
  badge: "✈️ BATCH ENROLMENT OPEN"
  title: "Aviation Career Program"
  subtitle: "Airline standard training led by veteran commanders with 37+ years flight experience."
  primaryCtaText: "Enquire Now"
  primaryCtaLink: "#contact"`
  },
  {
    id: "features",
    title: "Features Grid",
    badge: "Highlights & Curriculum",
    description: "Multi-column benefits grid showcasing aircraft fleet, simulators, and training modules.",
    icon: Layers,
    yaml: `- type: features
  heading: "Why Choose Airborne"
  columns: 3
  items:
    - title: "Airline Veteran Trainers"
      description: "Direct mentorship from retired airline AGMs and examiners."
      icon: "🧑‍✈️"
    - title: "Mock Cabin Simulator"
      description: "Full safety procedures and service flow inside our simulated aircraft cabin."
      icon: "🛫"
    - title: "Placement & Interview Prep"
      description: "Rigorous airline recruitment grooming and interview drives."
      icon: "💼"`
  },
  {
    id: "lead_magnet",
    title: "Lead Magnet Download",
    badge: "Starter Kit & Brochure",
    description: "Gated starter kit or syllabus download box with email/phone intake integration.",
    icon: BookOpen,
    yaml: `- type: lead_magnet
  title: "Download: Cabin Crew Starter Kit"
  subtitle: "Free syllabus preview, phonetic alphabet guide, and aviation terminology glossary."
  buttonText: "Download Free Preview"
  downloadUrl: "/media/cabin-crew-starter-kit.pdf"`
  },
  {
    id: "faq",
    title: "FAQ Accordion",
    badge: "Interactive Q&A",
    description: "Smooth expandable questions and answers section for syllabus and admission questions.",
    icon: AlertCircle,
    yaml: `- type: faq
  heading: "Frequently Asked Questions"
  items:
    - question: "Who is eligible for this training program?"
      answer: "Applicants must have passed 10+2 from a recognised board with minimum 50% marks."
    - question: "Are instalment plans or financing available?"
      answer: "Yes, flexible zero-interest instalment plans are available through our education banking partners."`
  },
  {
    id: "stats",
    title: "Stats Counter",
    badge: "Milestones & Credibility",
    description: "Grid of high-credibility metrics (e.g. 15+ years experience, 100% DGCA pass rate).",
    icon: Globe,
    yaml: `- type: stats
  items:
    - stat: "15+"
      label: "Years of Heritage"
    - stat: "1,200+"
      label: "Cadets Flying"
    - stat: "100%"
      label: "DGCA Exam Ground Pass Rate"`
  },
  {
    id: "cta_banner",
    title: "CTA Action Banner",
    badge: "Conversion Closer",
    description: "Full-width conversion banner placed at the bottom of the landing page.",
    icon: Megaphone,
    yaml: `- type: cta_banner
  heading: "Ready to Start Your Aviation Journey?"
  subheading: "Speak with an aviation career counsellor and get a tailored roadmap."
  buttonText: "Book Free Consultation"
  buttonLink: "/contact"`
  },
  {
    id: "rich_text",
    title: "Rich Text Editorial",
    badge: "Markdown Article",
    description: "Standard Markdown prose supporting headings, bullet points, and hyperlinks.",
    icon: FileText,
    yaml: `- type: rich_text
  content: |
    ## Professional Flight School
    Airborne Aviation Academy has been delivering airline-standard training in New Delhi since 2009.`
  }
];

export default function CMSPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  // Tabs: pagescms, pages, preview, payload, nav, gallery, news
  const [activeTab, setActiveTab] = React.useState("pagescms");
  
  // Payload CMS Studio state
  const [payloadView, setPayloadView] = React.useState<"admin" | "preview">("admin");
  const [customPayloadUrl, setCustomPayloadUrl] = React.useState<string>("");
  const [showUrlSettings, setShowUrlSettings] = React.useState(false);
  const activePayloadUrl = (customPayloadUrl.trim() || process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3101").replace(/\/+$/, "");
  const payloadAdminUrl = `${activePayloadUrl}/admin`;
  const payloadSiteUrl = activePayloadUrl;
  const currentPayloadIframeSrc = payloadView === "admin" ? payloadAdminUrl : payloadSiteUrl;

  // Website Preview State & Device Viewport
  const [previewEnv, setPreviewEnv] = React.useState<"cloud" | "local" | "custom">("local");
  const [customWebUrl, setCustomWebUrl] = React.useState<string>("");
  const [previewPath, setPreviewPath] = React.useState<string>("/pages/cabin-crew-overview");
  const [previewDevice, setPreviewDevice] = React.useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewRefreshKey, setPreviewRefreshKey] = React.useState<number>(0);

  // Default Cloud Run & Local URLs
  const cloudRunWebUrl = "https://airborne-web-368523757732.asia-south1.run.app";
  const localWebUrl = "http://localhost:3000";
  const activeBaseWebUrl = previewEnv === "cloud" ? cloudRunWebUrl : previewEnv === "local" ? localWebUrl : (customWebUrl.trim() || localWebUrl);
  const activeFullPreviewUrl = `${activeBaseWebUrl.replace(/\/+$/, "")}${previewPath.startsWith("/") ? previewPath : `/${previewPath}`}`;

  // Copy feedback state
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied to Clipboard", description: "YAML snippet copied. Paste it into Pages CMS or your markdown file." });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Search & DB pages query
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [editItem, setEditItem] = React.useState<Partial<PageModel> | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch CMS Pages from backend Page API
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["cms-pages", debouncedSearch],
    queryFn: async () => {
      const p = new URLSearchParams({
        page: "1",
        limit: "100",
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      const raw = await fetch(`/api/v1/pages?${p}`, { credentials: "include" });
      if (!raw.ok) throw new Error(`HTTP ${raw.status}`);
      const json = await raw.json() as { data: PageModel[]; meta?: { total: number } };
      return { data: json.data, total: json.meta?.total ?? json.data.length };
    },
    enabled: activeTab === "pages",
  });

  // Mutate: Create Page
  const createMutation = useMutation({
    mutationFn: (body: Partial<PageModel>) => 
      apiFetch<PageModel>("/pages", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-pages"] });
      toast({ title: "Page Created Successfully", description: "The new static page has been registered in the CMS." });
      setEditItem(null);
    },
    onError: (err) => {
      toast({ title: "Error Creating Page", description: err.message, variant: "destructive" });
    }
  });

  // Mutate: Update Page
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<PageModel> }) => 
      apiFetch<PageModel>(`/pages/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-pages"] });
      toast({ title: "Page Saved Successfully", description: "CMS contents updated and static cache invalidated." });
      setEditItem(null);
    },
    onError: (err) => {
      toast({ title: "Error Saving Page", description: err.message, variant: "destructive" });
    }
  });

  // Mutate: Publish / status transition
  const publishMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PageModel["status"] }) =>
      apiFetch<PageModel>(`/pages/${id}/publish`, { method: "POST", body: JSON.stringify({ status }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-pages"] });
      toast({ title: "Status Updated", description: "Page publishing status transitioned successfully." });
      setEditItem(null);
    },
    onError: (err) => {
      toast({ title: "Status Change Failed", description: err.message, variant: "destructive" });
    }
  });

  const handleSaveContent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const seoTitle = formData.get("seoTitle") as string;
    const seoDesc = formData.get("seoDesc") as string;

    const payload = {
      title,
      slug: slug || undefined,
      description: description || null,
      seoTitle: seoTitle || null,
      seoDesc: seoDesc || null,
    };

    if (editItem?.id) {
      updateMutation.mutate({ id: editItem.id, body: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const pagesList = data?.data ?? [];

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Website CMS & Content Hub" 
        description="Unified command center combining Pages CMS (Git-based modular landing pages) with Payload CMS (operational relational engine)." 
        action={
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => router.push("/cms/builder")} 
              className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 text-xs font-bold gap-1.5"
            >
              <LayoutTemplate className="h-4 w-4 mr-1" />
              Airborne Studio
            </Button>
            <Button 
              variant="outline" 
              onClick={() => { setActiveTab("preview"); setPreviewPath("/pages/cabin-crew-overview"); }} 
              className="border-white/10 hover:bg-white/5 text-xs font-bold gap-1.5"
            >
              <Eye className="h-4 w-4 text-emerald-400" />
              Live Preview
            </Button>
            <Button 
              onClick={() => { setActiveTab("pages"); setEditItem({ title: "", slug: "", description: "", seoTitle: "", seoDesc: "" }); }} 
              className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 text-xs font-bold"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Page Entry
            </Button>
          </div>
        }
      />

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1">
        {[
          { id: "pagescms", label: "Pages CMS (Git)", icon: GitBranch, badge: "Modular" },
          { id: "builder", label: "Airborne Studio", icon: LayoutTemplate, badge: "Visual" },
          { id: "preview", label: "Website Live Preview", icon: Eye, badge: "Interactive" },
          { id: "payload", label: "Payload CMS Studio", icon: Sparkles, badge: "Engine" },
          { id: "pages", label: "Core Web Pages", icon: Globe },
          { id: "nav", label: "Navigation Menus", icon: Menu },
          { id: "gallery", label: "Public Media Gallery", icon: ImageIcon },
          { id: "news", label: "News & Bulletins", icon: Megaphone },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "builder") {
                  router.push("/cms/builder");
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                isActive 
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground border-transparent"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-muted-foreground"}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold uppercase tracking-wider ${
                  isActive ? "bg-white/20 text-white" : "bg-white/5 text-muted-foreground"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: Pages CMS (Git Content-as-Code & Modular Sections) */}
        {activeTab === "pagescms" && (
          <motion.div key="pagescms" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            
            {/* Quick Launch & Repository Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-900/90 p-6 shadow-xl">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-300">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Git-Backed Content Engine Active
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">Branch: main</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    Pages CMS: Notion-Style Visual Editor for Airborne Aviation
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Non-technical editors can compose landing pages, insert modular marketing blocks, and edit copy visually. All changes commit safely to GitHub and hot-reload on the website instantly.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30">
                    <a href="https://app.pagescms.org/QalaLabs/Airbone" target="_blank" rel="noopener noreferrer">
                      <span>Launch Pages CMS Web Studio</span>
                      <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="border-white/10 hover:bg-white/5 text-xs font-bold text-white">
                    <a href="https://github.com/QalaLabs/Airbone/tree/main/content/pages" target="_blank" rel="noopener noreferrer">
                      <span>Browse Git Files</span>
                      <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                    </a>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => { setActiveTab("preview"); setPreviewPath("/pages/cabin-crew-overview"); }} 
                    className="border-white/10 hover:bg-white/5 text-xs font-bold text-white"
                  >
                    <span>Open Live Preview</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Registered Git Pages Table */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-400" />
                    Active Modular Pages in Git Repository
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Parsed directly from <code className="text-emerald-300 font-mono">content/pages/*.md</code> with zero database latency.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-secondary/30 border border-white/5 hover:border-emerald-500/30 transition-colors gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-base">
                      ✈️
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-white">Cabin Crew Academy Overview</p>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          LIVE &bull; 4 MODULAR SECTIONS
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Route: <span className="font-mono text-emerald-300 font-semibold">/pages/cabin-crew-overview</span> &bull; File: <span className="font-mono text-white/80">content/pages/cabin-crew-overview.md</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button 
                      size="sm" 
                      onClick={() => { setActiveTab("preview"); setPreviewPath("/pages/cabin-crew-overview"); }} 
                      className="bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 text-xs font-bold h-8"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleCopy(`${activeBaseWebUrl}/pages/cabin-crew-overview`, "link-cabin-crew")}
                      className="border-white/10 hover:bg-white/5 text-xs font-bold h-8"
                    >
                      {copiedId === "link-cabin-crew" ? <Check className="h-3.5 w-3.5 text-emerald-400 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                      Copy Link
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-secondary/30 border border-white/5 hover:border-white/10 transition-colors gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold text-base">
                      ⚙️
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-white">Academy Global Settings</p>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          SINGLETON
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        File: <span className="font-mono text-white/80">content/settings.json</span> (Phone: +91 99537 77320 &bull; Address: Sector 7 Dwarka)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button asChild size="sm" variant="outline" className="border-white/10 hover:bg-white/5 text-xs font-bold h-8">
                      <a href="https://app.pagescms.org/QalaLabs/Airbone" target="_blank" rel="noopener noreferrer">
                        <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                        Edit in Pages CMS
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modular Section Builder Palette & Cheatsheet */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    Modular Section Palette & YAML Generator
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Click &quot;Copy YAML Block&quot; on any section to copy the ready-to-use template, then paste directly into Pages CMS.
                  </p>
                </div>
                <span className="text-xs font-mono text-muted-foreground">7 Pre-built Sections</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MODULAR_BLOCK_TEMPLATES.map((block) => {
                  const Icon = block.icon;
                  const isCopied = copiedId === block.id;
                  return (
                    <div key={block.id} className="flex flex-col justify-between p-4 rounded-xl bg-slate-950/60 border border-white/10 hover:border-primary/40 transition-all group">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/30">
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-bold text-white">{block.title}</span>
                          </div>
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground font-mono">
                            {block.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {block.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-emerald-400 font-semibold">{block.badge}</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleCopy(block.yaml, block.id)}
                          className="h-7 px-2.5 text-[11px] font-bold border-white/10 hover:bg-white/10 text-white gap-1"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy YAML</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 2: Live Website Preview with Responsive Devices */}
        {activeTab === "preview" && (
          <motion.div key="preview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-4">
            
            {/* Viewport Control Bar */}
            <div className="glass-card rounded-2xl p-4 border border-white/10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              
              {/* Environment Switcher */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">Target:</span>
                <div className="flex rounded-lg bg-white/5 p-1 border border-white/10 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPreviewEnv("local")}
                    className={`px-3 py-1 rounded-md transition-all ${
                      previewEnv === "local" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    Localhost (:3000)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewEnv("cloud")}
                    className={`px-3 py-1 rounded-md transition-all ${
                      previewEnv === "cloud" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    Cloud Run Preview
                  </button>
                </div>
              </div>

              {/* Route Input Bar */}
              <div className="flex-1 flex items-center gap-2 max-w-xl">
                <span className="text-xs font-mono text-muted-foreground hidden sm:inline">{activeBaseWebUrl}</span>
                <Input
                  value={previewPath}
                  onChange={(e) => setPreviewPath(e.target.value)}
                  placeholder="/pages/cabin-crew-overview"
                  className="bg-black/40 border-white/10 text-xs font-mono text-white h-8"
                />
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setPreviewRefreshKey((k) => k + 1)}
                  className="h-8 border-white/10 hover:bg-white/5 text-xs font-bold"
                  title="Reload Preview"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Responsive Device Viewports */}
              <div className="flex items-center gap-2 self-end lg:self-auto">
                <div className="flex rounded-lg bg-white/5 p-1 border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded-md transition-all ${
                      previewDevice === "desktop" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                    }`}
                    title="Desktop (100%)"
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("tablet")}
                    className={`p-1.5 rounded-md transition-all ${
                      previewDevice === "tablet" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                    }`}
                    title="Tablet (768px)"
                  >
                    <Tablet className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded-md transition-all ${
                      previewDevice === "mobile" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                    }`}
                    title="Mobile (390px)"
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                </div>

                <Button asChild size="sm" variant="outline" className="border-white/10 hover:bg-white/5 text-xs font-bold h-8">
                  <a href={activeFullPreviewUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>

            </div>

            {/* Quick Route Shortcuts */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-muted-foreground">Quick Routes:</span>
              {[
                { label: "Cabin Crew Overview", path: "/pages/cabin-crew-overview" },
                { label: "Cabin Crew Training", path: "/courses/cabin-crew-training" },
                { label: "Commercial Pilot (CPL)", path: "/courses/commercial-pilot-license" },
                { label: "About Airborne", path: "/about" },
                { label: "Contact & Demo", path: "/contact" },
              ].map((route) => (
                <button
                  key={route.path}
                  type="button"
                  onClick={() => setPreviewPath(route.path)}
                  className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] transition-colors whitespace-nowrap ${
                    previewPath === route.path 
                      ? "bg-primary/20 text-primary border-primary/40 font-bold" 
                      : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {route.label}
                </button>
              ))}
            </div>

            {/* Device Frame */}
            <div className="flex justify-center w-full py-2">
              <div 
                className={`relative rounded-2xl overflow-hidden border border-white/15 bg-slate-950 shadow-2xl transition-all duration-300 ${
                  previewDevice === "desktop" 
                    ? "w-full h-[760px]" 
                    : previewDevice === "tablet" 
                    ? "w-[768px] h-[820px] shadow-primary/10" 
                    : "w-[390px] h-[800px] border-white/30 rounded-[40px] p-2 bg-slate-900 shadow-emerald-500/10"
                }`}
              >
                {previewDevice === "mobile" && (
                  <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2" />
                )}
                <iframe
                  key={previewRefreshKey}
                  src={activeFullPreviewUrl}
                  title="Website Live Device Preview"
                  className={`w-full h-full border-0 ${previewDevice === "mobile" ? "rounded-[32px]" : "rounded-xl"}`}
                />
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 3: Payload CMS Studio */}
        {activeTab === "payload" && (
          <motion.div key="payload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">Payload CMS Engine</h3>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live on Port 3101
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Operational database backend &bull; Endpoint: <code className="text-purple-300 font-mono">{activePayloadUrl}</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                  <div className="flex rounded-lg bg-white/5 p-1 border border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setPayloadView("admin")}
                      className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                        payloadView === "admin" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      Admin Studio
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayloadView("preview")}
                      className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                        payloadView === "preview" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      Site Preview
                    </button>
                  </div>

                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowUrlSettings(!showUrlSettings)}
                    className="h-8 w-8 p-0 border border-white/10"
                    title="Configure Engine Endpoint"
                  >
                    <Settings2 className="h-4 w-4 text-muted-foreground" />
                  </Button>

                  <Button asChild size="sm" variant="outline" className="border-white/10 hover:bg-white/5 text-xs font-bold gap-1.5">
                    <a href={currentPayloadIframeSrc} target="_blank" rel="noopener noreferrer">
                      <span>Open in New Tab</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Login Credentials Quick-Copy Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs">
                <span className="text-muted-foreground font-semibold">Studio Admin Credentials:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy("preview@local.test", "cred-email")}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-[11px]"
                  >
                    {copiedId === "cred-email" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    Email: preview@local.test
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy("PreviewPass123!", "cred-pass")}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-[11px]"
                  >
                    {copiedId === "cred-pass" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    Password: PreviewPass123!
                  </button>
                </div>
              </div>

              {/* Dynamic Endpoint Configuration Bar */}
              {showUrlSettings && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs">
                  <span className="font-semibold text-purple-300 whitespace-nowrap">Engine Endpoint:</span>
                  <input
                    type="text"
                    value={customPayloadUrl}
                    onChange={(e) => setCustomPayloadUrl(e.target.value)}
                    placeholder="e.g. http://localhost:3101 or https://payload-cms.your-domain.com"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setCustomPayloadUrl("http://localhost:3101")}
                      className="bg-white/5 hover:bg-white/10 text-[11px] font-bold h-7 px-2.5"
                    >
                      Reset Local (3101)
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setShowUrlSettings(false)}
                      className="bg-primary hover:bg-primary/90 text-white text-[11px] font-bold h-7 px-2.5"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}

              {/* Embedded Live Studio / Preview Frame */}
              <div className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-slate-950/80 shadow-2xl" style={{ height: "740px" }}>
                <iframe
                  src={currentPayloadIframeSrc}
                  title="Payload CMS Studio"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: Core Web Pages (Database Table) */}
        {activeTab === "pages" && (
          <motion.div key="pages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" /> Global Public Pages Directory
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Search public landing pages..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-secondary/40 border-white/10 text-xs font-semibold w-64" 
                  />
                </div>
              </div>

              {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground font-semibold">Loading CMS Pages...</p>
                </div>
              )}

              {isError && (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 rounded-xl border border-rose-500/20 bg-rose-500/10">
                  <AlertCircle className="h-10 w-10 text-rose-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Error Loading CMS Pages</h4>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">{error?.message || "Internal Server Error"}</p>
                  </div>
                  <Button onClick={() => refetch()} variant="outline" size="sm" className="border-white/10 text-xs font-bold">
                    Retry Loading
                  </Button>
                </div>
              )}

              {!isLoading && !isError && pagesList.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-2 border-2 border-dashed border-white/5 rounded-xl">
                  <p className="text-sm font-bold text-white">No CMS Pages Registered in DB</p>
                  <p className="text-xs text-muted-foreground">Click &quot;New Page Entry&quot; or use the Pages CMS (Git) tab for modular pages.</p>
                </div>
              )}

              {!isLoading && !isError && pagesList.length > 0 && (
                <div className="space-y-3 pt-2">
                  {pagesList.map((pg) => (
                    <div key={pg.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30 font-bold text-sm">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-white truncate">{pg.title}</p>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${pg.status === "PUBLISHED" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : pg.status === "SCHEDULED" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}`}>
                              {pg.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Route Slug: <span className="font-mono text-white font-medium">/{pg.slug}</span> • Version: v{pg.version} • Updated: {new Date(pg.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Button size="sm" onClick={() => router.push(`/cms/builder/${pg.id}`)} className="bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 text-xs font-bold py-1 px-3 h-8">
                          <Sparkles className="h-3 w-3 mr-1.5 text-emerald-400" /> Airborne Studio
                        </Button>
                        <Button size="sm" onClick={() => router.push(`/cms/pages/${pg.id}`)} className="bg-primary/20 hover:bg-primary/30 text-white border border-primary/30 text-xs font-bold py-1 px-3 h-8">
                          <Edit2 className="h-3 w-3 mr-1.5" /> Block Editor
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 border border-white/10" aria-label="Preview page" onClick={() => router.push(`/cms/pages/${pg.id}/preview`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 border border-white/10" aria-label="Status actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {(PAGE_TRANSITIONS[pg.status] ?? []).map((next) => {
                              const meta = TRANSITION_META[next];
                              const Icon = meta.icon;
                              return (
                                <DropdownMenuItem
                                  key={next}
                                  onClick={() => publishMutation.mutate({ id: pg.id, status: next })}
                                  disabled={publishMutation.isPending}
                                  className="cursor-pointer"
                                >
                                  <Icon className="mr-2 h-4 w-4" /> {meta.label}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 5: Navigation Menus */}
        {activeTab === "nav" && (
          <motion.div key="nav" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <NavMenuEditor />
          </motion.div>
        )}

        {/* TAB 6: Public Media Gallery */}
        {activeTab === "gallery" && (
          <motion.div key="gallery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/10 text-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-primary border border-primary/30 mx-auto shadow-xl">
                <ImageIcon className="h-8 w-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto mt-6">
                <h3 className="text-lg font-bold text-white tracking-tight">Media Gallery Synchronizer</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">The public gallery is linked to the Media Library. You can upload high-resolution fleet, aircraft, and campus photos directly.</p>
              </div>
              <Button asChild className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20 mt-6">
                <a href="/media">Open Media Library →</a>
              </Button>
            </div>
          </motion.div>
        )}

        {/* TAB 7: News Bulletins */}
        {activeTab === "news" && (
          <motion.div key="news" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/10 text-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mx-auto shadow-xl">
                <Megaphone className="h-8 w-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto mt-6">
                <h3 className="text-lg font-bold text-white tracking-tight">News & Announcements Bulletin</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Manage press releases, DGCA exam top ranker announcements, and cadet intake alerts via the unified Blog & Resources microservice.</p>
              </div>
              <Button asChild className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20 mt-6">
                <a href="/blog">Open Blog & Resources Module →</a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit/Create Content Modal */}
      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent className="max-w-xl glass-panel border-white/10 bg-slate-900/95">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-primary" />
              {editItem?.id ? "Edit CMS Static Page" : "Create New CMS Page"}
            </DialogTitle>
          </DialogHeader>
          {editItem && (
            <form onSubmit={handleSaveContent} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Content Display Title *</label>
                <Input name="title" defaultValue={editItem.title || ""} required className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Public URL Slug * (e.g. &quot;about-us&quot;)</label>
                <Input name="slug" defaultValue={editItem.slug || ""} required className="bg-secondary/40 border-white/10 text-xs font-mono text-primary font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Page Description</label>
                <Textarea name="description" defaultValue={editItem.description || ""} rows={3} className="bg-secondary/40 border-white/10 text-xs font-medium text-white leading-relaxed" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">SEO Meta Title tag</label>
                <Input name="seoTitle" defaultValue={editItem.seoTitle || ""} className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">SEO Meta Description tag</label>
                <Textarea name="seoDesc" defaultValue={editItem.seoDesc || ""} rows={2} className="bg-secondary/40 border-white/10 text-xs font-medium text-white leading-relaxed" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Publishing Status</label>
                {editItem.id ? (
                  <>
                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-secondary/40 px-3 py-2">
                      <span className="text-xs font-bold text-white">Current: <span className="text-primary">{editItem.status}</span></span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(PAGE_TRANSITIONS[editItem.status as PageModel["status"]] ?? []).map((next) => {
                        const meta = TRANSITION_META[next];
                        const Icon = meta.icon;
                        return (
                          <button
                            key={next}
                            type="button"
                            disabled={publishMutation.isPending}
                            onClick={() => publishMutation.mutate({ id: editItem.id!, status: next })}
                            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-secondary/60 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary/20 hover:border-primary/40 disabled:opacity-50"
                          >
                            <Icon className="h-3.5 w-3.5" /> {meta.label}
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg border border-white/10 bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
                    New pages are created as <span className="font-bold text-amber-400">DRAFT</span>. Use the status menu after creating to publish or archive.
                  </div>
                )}
              </div>
              <DialogFooter className="pt-4 border-t border-white/10">
                <Button type="button" variant="outline" onClick={() => setEditItem(null)} className="border-white/10 hover:bg-white/5 text-xs font-bold">Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Page"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}