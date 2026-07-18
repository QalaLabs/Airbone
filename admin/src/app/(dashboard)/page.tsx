"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, GraduationCap, BookOpen, Star, TrendingUp, Briefcase, 
  PhoneCall, MessageSquare, DollarSign, Calendar, Clock, UserCheck, 
  ArrowUpRight, ArrowDownRight, Activity, Zap, Bell, CheckCircle2, AlertCircle, Plus 
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { StatusBadge } from "@/components/shared/status-badge";

interface DashboardStats {
  todayLeads: number;
  weeklyLeads: number;
  monthlyLeads: number;
  monthlyAdmissions: number;
  monthlyRevenue: number;
  pendingFollowUps: number;
  voiceAiCalls: number;
  whatsappChats: number;
  activeCounselors: string;
  placementApplications: number;
  sourceDistribution: { source: string; count: number }[];
  funnelDistribution: { status: string; count: number }[];
  courseDistribution: { courseName: string; count: number }[];
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats"],
    queryFn: () => apiFetch<DashboardStats>("/dashboard/stats"),
  });

  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ["leads", "dashboard"],
    queryFn: () => apiFetch<{ items: any[]; total: number }>("/leads?page=1&limit=8"),
  });

  const recentLeads = leads?.items ?? [];

  const STAT_CARDS = React.useMemo(() => {
    if (!stats) return [];
    
    // Formatting revenue to Lakhs if appropriate
    const revLakhs = stats.monthlyRevenue >= 100000 
      ? `₹${(stats.monthlyRevenue / 100000).toFixed(1)}L` 
      : `₹${stats.monthlyRevenue.toLocaleString("en-IN")}`;

    return [
      { title: "Today's Leads", value: String(stats.todayLeads), change: "Real-time stream", isPos: true, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
      { title: "This Week", value: String(stats.weeklyLeads), change: "Active CRM pipeline", isPos: true, icon: Calendar, color: "text-indigo-500", bg: "bg-indigo-500/10" },
      { title: "Monthly Leads", value: String(stats.monthlyLeads), change: "30-day accumulation", isPos: true, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
      { title: "Admissions (30d)", value: String(stats.monthlyAdmissions), change: "Enrolled cadets", isPos: true, icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-500/10" },
      { title: "Revenue (30d)", value: revLakhs, change: "Cleared payments", isPos: true, icon: DollarSign, color: "text-amber-500", bg: "bg-amber-500/10" },
      { title: "Pending Follow Ups", value: String(stats.pendingFollowUps), change: "Urgent queue items", isPos: false, icon: Clock, color: "text-rose-500", bg: "bg-rose-500/10" },
      { title: "Voice AI Calls", value: String(stats.voiceAiCalls), change: "Connected telemetry", isPos: true, icon: PhoneCall, color: "text-cyan-500", bg: "bg-cyan-500/10" },
      { title: "WhatsApp Chats", value: String(stats.whatsappChats), change: "Outgoing triggers", isPos: true, icon: MessageSquare, color: "text-emerald-400", bg: "bg-emerald-400/10" },
      { title: "Active Counsellors", value: stats.activeCounselors, change: "Assigned staff", isPos: true, icon: UserCheck, color: "text-teal-500", bg: "bg-teal-500/10" },
      { title: "Placement Apps", value: String(stats.placementApplications), change: "Industry hiring", isPos: true, icon: Briefcase, color: "text-sky-500", bg: "bg-sky-500/10" },
    ];
  }, [stats]);

  const sourceChartData = React.useMemo(() => {
    if (!stats?.sourceDistribution) return [];
    const total = stats.sourceDistribution.reduce((acc, curr) => acc + curr.count, 0) || 1;
    const colors = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-indigo-500", "bg-teal-500"];
    
    return stats.sourceDistribution.map((src, idx) => {
      const percentage = ((src.count / total) * 100).toFixed(1);
      return {
        name: src.source.replace(/_/g, " "),
        count: `${src.count} leads`,
        value: `${percentage}%`,
        color: colors[idx % colors.length] || "bg-secondary",
      };
    });
  }, [stats]);

  const funnelChartData = React.useMemo(() => {
    if (!stats?.funnelDistribution) return [];
    const total = stats.funnelDistribution.reduce((acc, curr) => acc + curr.count, 0) || 1;
    const colors = ["bg-blue-600", "bg-indigo-600", "bg-violet-600", "bg-purple-600", "bg-pink-600", "bg-emerald-600", "bg-amber-600"];
    
    return stats.funnelDistribution.map((item, idx) => {
      const percentage = ((item.count / total) * 100).toFixed(1);
      return {
        stage: item.status.replace(/_/g, " "),
        count: String(item.count),
        percentage: `${percentage}%`,
        width: `${Math.max(5, (item.count / total) * 100)}%`,
        color: colors[idx % colors.length] || "bg-secondary",
      };
    });
  }, [stats]);

  const courseChartData = React.useMemo(() => {
    if (!stats?.courseDistribution) return [];
    const total = stats.courseDistribution.reduce((acc, curr) => acc + curr.count, 0) || 1;
    const colors = ["bg-amber-500", "bg-emerald-500", "bg-sky-500", "bg-rose-500", "bg-indigo-500"];

    return stats.courseDistribution.map((item, idx) => {
      const pct = ((item.count / total) * 100).toFixed(0);
      return {
        name: item.courseName,
        demand: `${pct}%`,
        count: `${item.count} leads`,
        color: colors[idx % colors.length] || "bg-secondary",
      };
    });
  }, [stats]);

  const NOTIFICATIONS = [
    { id: 1, title: "New Lead Intake", description: "Lead pipeline updated with fresh registrations.", time: "Just now", type: "info" },
    { id: 2, title: "Voice AI System Active", description: "Automated callbacks online for inbound inquiries.", time: "10m ago", type: "success" },
    { id: 3, title: "Placement Drives Open", description: "Cadet recruiters review new candidate portfolios.", time: "1h ago", type: "success" },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Activity className="h-6 w-6 text-primary animate-pulse" />
            Executive Command Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time telemetry, lead intake pipelines, and conversion performance for Airborne Aviation Academy.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-secondary/60 px-3 py-1.5 rounded-xl border border-white/5 text-xs font-semibold text-muted-foreground">
            <Zap className="h-4 w-4 text-amber-400 animate-bounce" />
            <span>Telemetry Hook Active</span>
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 space-y-3">
              <Skeleton className="h-4 w-24 bg-white/5" />
              <Skeleton className="h-8 w-16 bg-white/5" />
              <Skeleton className="h-3.5 w-32 bg-white/5" />
            </div>
          ))}
        </div>
      ) : statsError ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          Failed to load live database telemetry. Please ensure the database is accessible.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {STAT_CARDS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="glass-card rounded-2xl p-5 flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate pr-2">
                    {stat.title}
                  </span>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.bg} ${stat.color} shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-white tracking-tight">{stat.value}</div>
                  <div className="flex items-center gap-1 text-[11px] font-medium mt-1 text-muted-foreground">
                    <span className="text-primary/90">{stat.change}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Charts Grid Section */}
      {!statsLoading && !statsError && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Lead Sources */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Lead Sources</h3>
              <p className="text-xl font-bold text-white mt-1">Acquisition Channels</p>
              {sourceChartData.length === 0 ? (
                <div className="text-xs text-muted-foreground py-8 text-center">No lead sources logged in database.</div>
              ) : (
                <div className="mt-6 space-y-4">
                  {sourceChartData.map((src) => (
                    <div key={src.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-foreground">{src.name}</span>
                        <span className="text-muted-foreground">{src.count} ({src.value})</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden p-0.5">
                        <motion.div initial={{ width: 0 }} animate={{ width: src.value }} transition={{ duration: 1, ease: "easeOut" }} className={`h-full rounded-full ${src.color}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-white/10 pt-4 mt-6 flex items-center justify-between text-xs text-muted-foreground">
              <span>Updating live from database</span>
            </div>
          </motion.div>

          {/* Chart 2: Conversion Funnel */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }} className="glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Conversion Funnel</h3>
              <p className="text-xl font-bold text-white mt-1">Lead status distribution</p>
              {funnelChartData.length === 0 ? (
                <div className="text-xs text-muted-foreground py-8 text-center">No lead states logged in database.</div>
              ) : (
                <div className="mt-6 space-y-3">
                  {funnelChartData.map((step) => (
                    <div key={step.stage} className="relative bg-secondary/30 rounded-xl p-3 border border-white/5 flex items-center justify-between overflow-hidden group hover:border-white/10 transition-colors">
                      <motion.div initial={{ width: 0 }} animate={{ width: step.width }} transition={{ duration: 1, delay: 0.2 }} className={`absolute left-0 top-0 bottom-0 opacity-20 ${step.color}`} />
                      <span className="relative text-xs font-bold text-white z-10">{step.stage}</span>
                      <span className="relative text-xs font-extrabold text-primary z-10">{step.count} ({step.percentage})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-white/10 pt-4 mt-6 flex items-center justify-between text-xs text-muted-foreground">
              <span>Conversion pipeline stages</span>
            </div>
          </motion.div>

          {/* Chart 3: Course Popularity */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.2 }} className="glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Course Popularity</h3>
              <p className="text-xl font-bold text-white mt-1">Lead Interest distribution</p>
              {courseChartData.length === 0 ? (
                <div className="text-xs text-muted-foreground py-8 text-center">No course interests logged.</div>
              ) : (
                <div className="mt-6 space-y-4">
                  {courseChartData.map((c) => (
                    <div key={c.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-foreground truncate pr-2">{c.name}</span>
                        <span className="text-muted-foreground shrink-0">{c.count} ({c.demand})</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden p-0.5">
                        <motion.div initial={{ width: 0 }} animate={{ width: c.demand }} transition={{ duration: 1, ease: "easeOut", delay: 0.3 }} className={`h-full rounded-full ${c.color}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-white/10 pt-4 mt-6 flex items-center justify-between text-xs text-muted-foreground">
              <span>Program distribution</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Recent Activity Feed & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Leads Queue */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 flex flex-col justify-between border border-white/10">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Recent Incoming Leads</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Real-time telemetry of incoming student applications</p>
              </div>
              <a href="/leads" className="text-xs font-bold text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                View All Leads →
              </a>
            </div>

            {leadsLoading ? (
              <div className="mt-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center p-3.5 rounded-xl bg-secondary/10">
                    <Skeleton className="h-10 w-10 rounded-xl bg-white/5" />
                    <div className="flex-1 ml-4 space-y-2">
                      <Skeleton className="h-4 w-32 bg-white/5" />
                      <Skeleton className="h-3 w-48 bg-white/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentLeads.length === 0 ? (
              <div className="text-sm text-muted-foreground py-16 text-center">No leads found in CRM database.</div>
            ) : (
              <div className="mt-4 space-y-3">
                {recentLeads.map((lead) => (
                  <motion.div 
                    key={lead.id} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-white/5 hover:border-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary font-bold border border-primary/30 group-hover:scale-105 transition-transform">
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <a href={`/leads/${lead.id}`} className="text-sm font-semibold text-white hover:text-primary transition-colors truncate">
                            {lead.name}
                          </a>
                          {lead.courseInterest && (
                            <span className="text-[10px] font-semibold bg-secondary px-2 py-0.5 rounded border border-white/5 text-muted-foreground hidden sm:inline-block">
                              {lead.courseInterest}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="truncate">{lead.email || "No email"}</span>
                          <span className="hidden sm:inline-block">•</span>
                          <span className="hidden sm:inline-block font-mono text-[11px]">{lead.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <StatusBadge status={lead.status} domain="lead" />
                      <span className="text-[11px] text-muted-foreground font-medium">{formatDate(lead.createdAt)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Notifications & Quick Actions */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary animate-pulse" />
                System Status
              </h2>
              <span className="text-[10px] font-extrabold bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full">
                ONLINE
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {NOTIFICATIONS.map((n) => (
                <div key={n.id} className="p-3 rounded-xl bg-secondary/30 border border-white/5 hover:border-white/10 transition-colors flex gap-3">
                  {n.type === "success" ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" /> : n.type === "warning" ? <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" /> : <Bell className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white truncate">{n.title}</p>
                      <span className="text-[10px] font-medium text-muted-foreground shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{n.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10">
            <h2 className="text-base font-bold text-white border-b border-white/10 pb-4">Quick Actions</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { icon: Users, label: "Add Lead", href: "/leads" },
                { icon: GraduationCap, label: "Admissions", href: "/admissions" },
                { icon: Star, label: "Testimonials", href: "/testimonials" },
                { icon: Briefcase, label: "Placements", href: "/placements" },
              ].map((act) => (
                <a
                  key={act.href}
                  href={act.href}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-secondary/40 hover:bg-secondary border border-white/5 hover:border-white/10 transition-all group text-center"
                >
                  <act.icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-foreground">{act.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
