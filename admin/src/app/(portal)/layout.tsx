"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  BookOpen,
  LayoutDashboard,
  Award,
  ClipboardCheck,
  LogOut,
  Plane,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/portal/courses", label: "My Courses", icon: BookOpen, exact: false },
  { href: "/portal/progress", label: "Progress", icon: BarChart3, exact: false },
  { href: "/portal/attendance", label: "Attendance", icon: ClipboardCheck, exact: false },
  { href: "/portal/certificates", label: "Certificates", icon: Award, exact: false },
  { href: "/portal/assistant", label: "AI Assistant", icon: Sparkles, exact: false },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  React.useEffect(() => {
    if (status === "authenticated" && session?.user?.role && session.user.role !== "STUDENT") {
      window.location.href = "/";
    }
  }, [status, session]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b1f3a]">
        <div className="flex flex-col items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c8102e]">
            <Plane className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <p className="text-sm text-white/50">Loading portal…</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    if (typeof window !== "undefined") {
      window.location.href = "/login?callbackUrl=/portal";
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0b1f3a] text-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0a1a30]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0a1a30]/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          {/* Brand */}
          <Link
            href="/portal"
            className="flex items-center gap-2 font-semibold tracking-tight"
            aria-label="Airborne Student Portal — Dashboard"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c8102e]">
              <Plane className="h-4 w-4 text-white" aria-hidden="true" />
            </span>
            <span className="text-white">
              Airborne{" "}
              <span className="font-normal text-white/55">Student</span>
            </span>
          </Link>

          {/* User + sign out */}
          <div className="flex items-center gap-3 text-sm">
            {session?.user?.name && (
              <span className="hidden text-white/55 sm:inline text-xs">
                {session.user.name}
              </span>
            )}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/60 hover:bg-white/5 hover:text-white transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>

        {/* Nav tabs */}
        <nav
          aria-label="Student portal navigation"
          className="mx-auto flex max-w-6xl gap-0.5 overflow-x-auto px-2 pb-2 scrollbar-none"
        >
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:bg-white/5 hover:text-white/90",
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
