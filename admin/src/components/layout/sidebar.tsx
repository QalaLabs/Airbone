"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  Briefcase,
  Star,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Plane,
  Globe,
  PieChart,
  Settings,
  ShieldCheck,
  Building2,
  TrendingUp,
  Handshake,
  GitFork,
  Send,
  CalendarDays,
  BarChart3,
  Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

const NAV_GROUPS = [
  {
    label: "Core Analytics",
    items: [
      { href: "/", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/crm/analytics", icon: PieChart, label: "Analytics & Reports" },
    ]
  },
  {
    label: "Sales CRM",
    items: [
      { href: "/crm/dashboard", icon: TrendingUp, label: "CRM Dashboard" },
      { href: "/crm/leads", icon: Users, label: "Leads" },
      { href: "/crm/pipeline", icon: GitFork, label: "Pipeline" },
      { href: "/crm/deals", icon: Handshake, label: "Deals" },
      { href: "/crm/outreach", icon: Send, label: "Outreach" },
      { href: "/crm/meetings", icon: CalendarDays, label: "Meetings" },
      { href: "/crm/analytics", icon: BarChart3, label: "Analytics" },
      { href: "/crm/integrations", icon: Plug, label: "Integrations" },
    ]
  },
  {
    label: "CRM & Admissions",
    items: [
      { href: "/leads", icon: Users, label: "Lead Management" },
      { href: "/admissions", icon: GraduationCap, label: "Admissions" },
      { href: "/students", icon: Users, label: "Student Management" },
      { href: "/placements", icon: Briefcase, label: "Placements" },
    ]
  },
  {
    label: "Website & CMS",
    items: [
      { href: "/cms", icon: Globe, label: "Website CMS" },
      { href: "/courses", icon: BookOpen, label: "Course Manager" },
      { href: "/blog", icon: FileText, label: "Blog & Resources" },
      { href: "/testimonials", icon: Star, label: "Testimonials", badge: true },
      { href: "/media", icon: ImageIcon, label: "Media Library" },
    ]
  },
  {
    label: "System & Config",
    items: [
      { href: "/users", icon: Building2, label: "User Management" },
      { href: "/settings", icon: Settings, label: "Settings" },
      { href: "/audit", icon: ShieldCheck, label: "Audit Logs" },
    ]
  }
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const { data: pendingCount } = useQuery({
    queryKey: ["testimonials", "pending-count"],
    queryFn: () => apiFetch<{ count: number }>("/testimonials/pending-count"),
    refetchInterval: 60_000,
  });

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-full flex-col border-r border-border bg-card transition-all duration-300 z-30 shadow-xl",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {/* Logo */}
        <div className={cn("flex h-14 items-center border-b border-border px-3 bg-secondary/20", collapsed ? "justify-center" : "gap-3 px-4")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-blue-600 shadow-md shadow-primary/20">
            <Plane className="h-4 w-4 text-white animate-pulse" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-white truncate tracking-tight">Airborne OS</p>
                <span className="text-[9px] font-extrabold bg-primary/20 text-primary border border-primary/30 px-1 py-0.5 rounded">PRO</span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate font-medium">Enterprise Aviation CRM</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-6">
          {NAV_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              {!collapsed && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                  const showBadge = item.badge && pendingCount && pendingCount.count > 0;

                  return collapsed ? (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "relative flex h-10 w-full items-center justify-center rounded-xl transition-all",
                            isActive
                              ? "bg-primary text-white shadow-md shadow-primary/20"
                              : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {showBadge && (
                            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                              {pendingCount.count > 9 ? "9+" : pendingCount.count}
                            </span>
                          )}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="glass-panel border-white/10 font-semibold">{item.label}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative flex h-10 w-full items-center gap-3.5 rounded-xl px-3 text-sm font-semibold transition-all group",
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                      )}
                    >
                      <item.icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                      <span className="truncate">{item.label}</span>
                      {showBadge && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white animate-pulse">
                          {pendingCount.count > 9 ? "9+" : pendingCount.count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Toggle */}
        <div className="border-t border-border p-3 bg-secondary/10">
          <button
            onClick={onToggle}
            className="flex h-10 w-full items-center justify-center rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors border border-transparent hover:border-white/5 font-semibold"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : (
              <div className="flex w-full items-center gap-3 px-3">
                <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm">Collapse Sidebar</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
