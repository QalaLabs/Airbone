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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/leads", icon: Users, label: "Leads" },
  { href: "/admissions", icon: GraduationCap, label: "Admissions" },
  { href: "/students", icon: Users, label: "Students" },
  { href: "/courses", icon: BookOpen, label: "Courses" },
  { href: "/resources", icon: FileText, label: "Resources" },
  { href: "/jobs", icon: Briefcase, label: "Jobs" },
  { href: "/testimonials", icon: Star, label: "Testimonials", badge: true },
  { href: "/media", icon: ImageIcon, label: "Media" },
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
          "flex h-full flex-col border-r border-border bg-card transition-all duration-300",
          collapsed ? "w-16" : "w-60",
        )}
      >
        {/* Logo */}
        <div className={cn("flex h-14 items-center border-b border-border px-3", collapsed ? "justify-center" : "gap-3 px-4")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Plane className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-foreground truncate">Airborne OS</p>
              <p className="text-xs text-muted-foreground truncate">Aviation Academy</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {NAV_ITEMS.map((item) => {
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
                      "relative flex h-9 w-full items-center justify-center rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
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
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex h-9 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
                {showBadge && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                    {pendingCount.count > 9 ? "9+" : pendingCount.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Toggle */}
        <div className="border-t border-border p-2">
          <button
            onClick={onToggle}
            className="flex h-9 w-full items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : (
              <div className="flex w-full items-center gap-3 px-3">
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span className="text-sm">Collapse</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
