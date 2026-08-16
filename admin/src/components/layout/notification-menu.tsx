"use client";

import * as React from "react";
import { Bell, CheckCheck, AlertCircle, BookOpen, UserPlus, Info, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "alert" | "lead" | "lms" | "info";
  unread: boolean;
  link?: string;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "New Lead Intake",
    description: "Rahul Sharma requested CPL Ground School brochure.",
    time: "5m ago",
    type: "lead",
    unread: true,
    link: "/crm/leads",
  },
  {
    id: "2",
    title: "Assignment Submission",
    description: "Arjun Submitted Meteorology Module 3 Quiz.",
    time: "25m ago",
    type: "lms",
    unread: true,
    link: "/lms/courses",
  },
  {
    id: "3",
    title: "System Maintenance",
    description: "Scheduled database backup at 02:00 UTC.",
    time: "2h ago",
    type: "info",
    unread: false,
  },
];

export function NotificationMenu() {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [open, setOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === "unread" ? n.unread : true
  );

  const getTypeIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "alert":
        return <AlertCircle className="h-4 w-4 text-rose-400" />;
      case "lead":
        return <UserPlus className="h-4 w-4 text-emerald-400" />;
      case "lms":
        return <BookOpen className="h-4 w-4 text-sky-400" />;
      default:
        return <Info className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`View notifications. ${unreadCount} unread`}
          className={cn(
            "relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 outline-none",
            "border border-white/10 bg-secondary/40 hover:bg-secondary hover:border-primary/30",
            "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            open && "bg-secondary border-primary/40 shadow-[0_0_15px_rgba(219,36,30,0.25)]"
          )}
        >
          <Bell className="h-4 w-4 text-foreground/80 transition-transform group-hover:scale-110" />

          {unreadCount > 0 && (
            <>
              <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(219,36,30,0.6)] animate-pulse">
                {unreadCount}
              </span>
              <span className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full bg-destructive/40 animate-ping" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className={cn(
          "w-full max-w-[calc(100vw-2rem)] sm:w-96 rounded-2xl border border-white/10 p-0 shadow-2xl backdrop-blur-2xl bg-slate-950/95 text-foreground z-50",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-wide">Notifications</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {unreadCount} new
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary min-h-[32px] px-2"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-white/10 px-3 py-1.5 gap-1 bg-white/[0.02]">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all min-h-[36px]",
              filter === "all"
                ? "bg-primary/15 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={cn(
              "flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all min-h-[36px]",
              filter === "unread"
                ? "bg-primary/15 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/10">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-muted-foreground mb-3">
                <Bell className="h-6 w-6 opacity-40" />
              </div>
              <p className="text-sm font-medium text-white/80">No notifications</p>
              <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => markAsRead(item.id)}
                className={cn(
                  "group relative flex items-start gap-3.5 p-3.5 transition-all hover:bg-white/[0.04] cursor-pointer min-h-[64px]",
                  item.unread && "bg-primary/[0.04]"
                )}
              >
                {/* Icon Badge */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/40 transition-colors">
                  {getTypeIcon(item.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("text-xs font-semibold truncate", item.unread ? "text-white" : "text-white/70")}>
                      {item.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Unread Indicator Dot */}
                {item.unread && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-primary mt-1.5 shadow-[0_0_8px_rgba(219,36,30,0.8)]" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-2 text-center bg-white/[0.01]">
          <a
            href="/admin/notifications"
            className="flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-bold text-primary hover:bg-primary/10 transition-colors min-h-[40px]"
          >
            <span>View All Notifications</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
