"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Command, ArrowRight, CornerDownLeft, FileText, Users, GraduationCap, BookOpen, Briefcase, Settings, Star, ShieldCheck, Activity, Globe, Layout, Image as ImageIcon, MessageSquare, PieChart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MODULES = [
  { id: "dashboard", name: "Executive Dashboard", category: "Analytics & Core", shortcut: "G D", href: "/", icon: Activity },
  { id: "leads", name: "Lead Management & CRM", category: "Core CRM", shortcut: "G L", href: "/leads", icon: Users },
  { id: "admissions", name: "Admissions Workflow", category: "Operations", shortcut: "G A", href: "/admissions", icon: GraduationCap },
  { id: "students", name: "Student Management", category: "Operations", shortcut: "G S", href: "/students", icon: Users },
  { id: "courses", name: "Course Manager", category: "Academic", shortcut: "G C", href: "/courses", icon: BookOpen },
  { id: "placements", name: "Placements & Airlines", category: "Career", shortcut: "G P", href: "/placements", icon: Briefcase },
  { id: "cms", name: "Website CMS Editor", category: "Web & Content", shortcut: "G W", href: "/cms", icon: Globe },
  { id: "page-builder", name: "Visual Page Builder", category: "Web & Content", shortcut: "G B", href: "/page-builder", icon: Layout },
  { id: "media", name: "Media Library", category: "Web & Content", shortcut: "G M", href: "/media", icon: ImageIcon },
  { id: "blog", name: "Blog & Resources", category: "Web & Content", shortcut: "G R", href: "/blog", icon: FileText },
  { id: "automations", name: "Automations & Webhooks", category: "Integrations", shortcut: "G U", href: "/automations", icon: MessageSquare },
  { id: "analytics", name: "Advanced Analytics & Reports", category: "Analytics & Core", shortcut: "G N", href: "/analytics", icon: PieChart },
  { id: "testimonials", name: "Testimonials Reviews", category: "Web & Content", shortcut: "G T", href: "/testimonials", icon: Star },
  { id: "users", name: "User Management & RBAC", category: "System", shortcut: "G U", href: "/users", icon: Users },
  { id: "settings", name: "System Settings", category: "System", shortcut: "G E", href: "/settings", icon: Settings },
  { id: "audit-logs", name: "Audit Logs", category: "System", shortcut: "G X", href: "/audit", icon: ShieldCheck },
];

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const filtered = React.useMemo(() => {
    if (!search) return MODULES;
    return MODULES.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (open) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filtered.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (filtered[selectedIndex]) {
            router.push(filtered[selectedIndex].href);
            onOpenChange(false);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, filtered, selectedIndex, onOpenChange, router]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-50 w-full max-w-2xl rounded-2xl glass-panel border border-white/10 shadow-2xl overflow-hidden bg-slate-900/90"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Search className="h-5 w-5 text-primary animate-pulse" />
              <input
                type="text"
                autoFocus
                placeholder="Search modules, pages, quick actions... (Press Enter to open)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-base font-medium"
              />
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md border border-white/5">
                <Command className="h-3 w-3" />
                <span>ESC to exit</span>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No matching modules or actions found for &quot;{search}&quot;.
                </div>
              ) : (
                filtered.map((item, index) => {
                  const Icon = item.icon;
                  const active = index === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        router.push(item.href);
                        onOpenChange(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-all ${
                        active ? "bg-primary/20 border border-primary/30 shadow-lg shadow-primary/5 text-white" : "text-muted-foreground hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                          active ? "bg-primary text-white border-primary" : "bg-secondary border-white/5 text-muted-foreground"
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate ${active ? "text-white" : "text-foreground"}`}>
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{item.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="hidden sm:inline-block text-[11px] font-mono text-muted-foreground bg-black/30 px-2 py-1 rounded border border-white/5">
                          {item.shortcut}
                        </span>
                        <CornerDownLeft className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5 text-xs text-muted-foreground bg-black/40">
              <div className="flex items-center gap-4">
                <span>↑↓ Navigate</span>
                <span>↵ Open</span>
              </div>
              <span className="text-primary font-medium">Airborne Enterprise CRM</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
