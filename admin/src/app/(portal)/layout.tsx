"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { BookOpen, LayoutDashboard, Award, ClipboardCheck, LogOut, Plane, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/courses", label: "My Courses", icon: BookOpen },
  { href: "/portal/attendance", label: "Attendance", icon: ClipboardCheck },
  { href: "/portal/certificates", label: "Certificates", icon: Award },
  { href: "/portal/assistant", label: "AI Assistant", icon: Sparkles },
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
      <div className="flex min-h-screen items-center justify-center bg-[#0b1f3a] text-white">
        Loading portal…
      </div>
    );
  }

  if (status === "unauthenticated") {
    if (typeof window !== "undefined") window.location.href = "/login?callbackUrl=/portal";
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0b1f3a] text-slate-100">
      <header className="border-b border-white/10 bg-[#0a1a30]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/portal" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c8102e]">
              <Plane className="h-4 w-4 text-white" />
            </span>
            <span>
              Airborne <span className="text-white/60 font-normal">Student</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-white/70 sm:inline">{session?.user?.name}</span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="inline-flex items-center gap-1 rounded-md border border-white/15 px-2.5 py-1.5 text-xs hover:bg-white/5"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 pb-2">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/portal" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium",
                  active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
