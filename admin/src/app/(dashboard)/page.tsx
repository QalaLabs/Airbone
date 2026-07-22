"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, GraduationCap, BookOpen, Star, TrendingUp, FileText, Briefcase, 
  PhoneCall, MessageSquare, DollarSign, Calendar, Clock, UserCheck, 
  ArrowUpRight, ArrowDownRight, Activity, Zap, Bell, CheckCircle2, AlertCircle, Plus 
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface DashboardLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  courseInterest?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: leads } = useQuery({
    queryKey: ["leads", "dashboard"],
    queryFn: () => apiFetch<{ items: DashboardLead[]; total: number }>("/leads?page=1&limit=8"),
  });

  const STAT_CARDS = [
    { title: "Today's Leads", value: "48", change: "+12% vs yesterday", isPos: true, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "This Week", value: "312", change: "+8% vs last week", isPos: true, icon: Calendar, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { title: "Monthly Leads", value: "1,248", change: "+24% vs last month", isPos: true, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Admissions", value: "84", change: "+15% vs last month", isPos: true, icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Revenue", value: "₹42.8L", change: "+18% vs target", isPos: true, icon: DollarSign, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Pending Follow Ups", value: "19", change: "-5% urgent queue", isPos: false, icon: Clock, color: "text-rose-500", bg: "bg-rose-500/10" },
    { title: "Voice AI Calls", value: "892", change: "94% connection rate", isPos: true, icon: PhoneCall, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { title: "WhatsApp Conversations", value: "1,420", change: "88% read rate", isPos: true, icon: MessageSquare, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { title: "Active Counsellors", value: "12 / 12", change: "100% online", isPos: true, icon: UserCheck, color: "text-teal-500", bg: "bg-teal-500/10" },
    { title: "Placement Applications", value: "156", change: "3 Airlines recruiting", isPos: true, icon: Briefcase, color: "text-sky-500", bg: "bg-sky-500/10" },
  ];

  const recentLeads = leads?.items ?? [
    { id: "1", name: "Captain Vikram Singh", email: "vikram@flying.club", status: "NEW", createdAt: new Date().toISOString(), phone: "+91 98765 43210", courseInterest: "DGCA CPL Ground School" },
    { id: "2", name: "Ananya Sharma", email: "ananya.s@aviation.in", status: "CONTACTED", createdAt: new Date(Date.now() - 3600000).toISOString(), phone: "+91 98234 56789", courseInterest: "Cadet Pilot Program" },
    { id: "3", name: "Rohan Verma", email: "rohan.v@gmail.com", status: "INTERESTED", createdAt: new Date(Date.now() - 7200000).toISOString(), phone: "+91 98111 22334", courseInterest: "A320 Type Rating" },
    { id: "4", name: "Priya Patel", email: "priya@outlook.com", status: "COUNSELED", createdAt: new Date(Date.now() - 14400000).toISOString(), phone: "+91 98444 55667", courseInterest: "Commercial Pilot License" },
    { id: "5", name: "Amit Gupta", email: "amit.g@aviation.org", status: "FOLLOW_UP", createdAt: new Date(Date.now() - 28800000).toISOString(), phone: "+91 98555 66778", courseInterest: "Cadet Pilot Program" },
  ];

  const NOTIFICATIONS = [
    { id: 1, title: "New Lead Spike", description: "42 leads captured from Google Ads campaign in the last hour.", time: "10m ago", type: "info" },
    { id: 2, title: "Voice AI Milestone", description: "Vapi bot successfully scheduled 14 counselor call backs today.", time: "25m ago", type: "success" },
    { id: 3, title: "Indigo Hiring Drive", description: "Placement cell received 45 new screening slots for A320 cadets.", time: "1h ago", type: "success" },
    { id: 4, title: "Counselor SLA Warning", description: "3 leads assigned to Delhi Campus pending follow-up > 4 hours.", time: "2h ago", type: "warning" },
  ];

  return (
    <div className="space-y-8 pb-12">
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
            <span>AI Webhooks Active</span>
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-105">
            <Plus className="h-4 w-4" />
            <span>Quick Enroll</span>
          </button>
        </div>
      </div>

      {/* 10 Executive Stat Cards */}
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
                  {stat.isPos ? <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> : <ArrowDownRight className="h-3.5 w-3.5 text-rose-400 shrink-0" />}
                  <span className={stat.isPos ? "text-emerald-400/90" : "text-rose-400/90"}>{stat.change}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Lead Sources */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Lead Sources</h3>
            <p className="text-xl font-bold text-white mt-1">Acquisition Channels</p>
            <div className="mt-6 space-y-4">
              {[
                { name: "Google Search & Ads", value: "48%", count: "602 leads", color: "bg-blue-500" },
                { name: "Meta Social (FB/IG)", value: "26%", count: "324 leads", color: "bg-purple-500" },
                { name: "Organic SEO & Direct", value: "16%", count: "200 leads", color: "bg-emerald-500" },
                { name: "Referrals & Aviation Groups", value: "10%", count: "122 leads", color: "bg-amber-500" },
              ].map((src) => (
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
          </div>
          <div className="border-t border-white/10 pt-4 mt-6 flex items-center justify-between text-xs text-muted-foreground">
            <span>Updating live from intake hooks</span>
            <a href="/analytics" className="text-primary hover:underline font-semibold">View full report →</a>
          </div>
        </motion.div>

        {/* Chart 2: Conversion Funnel */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }} className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Conversion Funnel</h3>
            <p className="text-xl font-bold text-white mt-1">Lead to Admission Stages</p>
            <div className="mt-6 space-y-3">
              {[
                { stage: "1. Total Leads Captured", count: "1,248", percentage: "100%", width: "100%", color: "bg-blue-600" },
                { stage: "2. Voice AI Verified", count: "982", percentage: "78.6%", width: "79%", color: "bg-indigo-600" },
                { stage: "3. Counselor Connected", count: "640", percentage: "51.2%", width: "51%", color: "bg-violet-600" },
                { stage: "4. Campus Visited & Demo", count: "212", percentage: "17.0%", width: "25%", color: "bg-purple-600" },
                { stage: "5. Fully Enrolled Cadets", count: "84", percentage: "6.7%", width: "12%", color: "bg-emerald-600" },
              ].map((step) => (
                <div key={step.stage} className="relative bg-secondary/30 rounded-xl p-3 border border-white/5 flex items-center justify-between overflow-hidden group hover:border-white/10 transition-colors">
                  <motion.div initial={{ width: 0 }} animate={{ width: step.width }} transition={{ duration: 1, delay: 0.2 }} className={`absolute left-0 top-0 bottom-0 opacity-20 ${step.color}`} />
                  <span className="relative text-xs font-bold text-white z-10">{step.stage}</span>
                  <span className="relative text-xs font-extrabold text-primary z-10">{step.count} ({step.percentage})</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/10 pt-4 mt-6 flex items-center justify-between text-xs text-muted-foreground">
            <span>Friction point: Counselor connection</span>
            <a href="/admissions" className="text-primary hover:underline font-semibold">Optimize funnel →</a>
          </div>
        </motion.div>

        {/* Chart 3: Course Popularity */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.2 }} className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Course Popularity</h3>
            <p className="text-xl font-bold text-white mt-1">Student Demand Distribution</p>
            <div className="mt-6 space-y-4">
              {[
                { name: "DGCA CPL Ground School", demand: "45%", seats: "42/50 filled", color: "bg-amber-500" },
                { name: "Cadet Pilot Program (Indigo/AI)", demand: "30%", seats: "28/30 filled", color: "bg-emerald-500" },
                { name: "A320 / B737 Type Rating", demand: "15%", seats: "14/20 filled", color: "bg-sky-500" },
                { name: "ATPL Theory & RTR(A)", demand: "10%", seats: "10/30 filled", color: "bg-rose-500" },
              ].map((c) => (
                <div key={c.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-foreground truncate pr-2">{c.name}</span>
                    <span className="text-muted-foreground shrink-0">{c.seats}</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden p-0.5">
                    <motion.div initial={{ width: 0 }} animate={{ width: c.demand }} transition={{ duration: 1, ease: "easeOut", delay: 0.3 }} className={`h-full rounded-full ${c.color}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/10 pt-4 mt-6 flex items-center justify-between text-xs text-muted-foreground">
            <span>Next batch starts in 14 days</span>
            <a href="/courses" className="text-primary hover:underline font-semibold">Manage batches →</a>
          </div>
        </motion.div>
      </div>

      {/* Secondary Charts: Daily Leads, Monthly Admissions, Revenue Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { title: "Daily Leads Velocity", metric: "48 Leads/day avg", desc: "Peak hours: 10 AM to 2 PM EST", color: "from-blue-500 to-indigo-600", heights: [40, 60, 45, 80, 75, 90, 85, 95] },
          { title: "Monthly Admissions Target", metric: "84 Enrolled / 100 Goal", desc: "84% pacing for current intake", color: "from-emerald-500 to-teal-600", heights: [30, 40, 55, 65, 70, 82, 84, 88] },
          { title: "Revenue Trajectory", metric: "₹42.8L Collected", desc: "+18% growth month-over-month", color: "from-amber-500 to-rose-500", heights: [50, 45, 60, 70, 85, 95, 90, 100] },
        ].map((ch, chIdx) => (
          <motion.div key={ch.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 + chIdx * 0.1 }} className="glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{ch.title}</h3>
              <div className="text-xl font-extrabold text-white mt-1">{ch.metric}</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{ch.desc}</p>
              
              {/* Simulated Gorgeous Bar Chart */}
              <div className="mt-8 flex items-end justify-between gap-2 h-28 pt-4 border-b border-white/10 pb-2">
                {ch.heights.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <span className="text-[9px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">{h}%</span>
                    <motion.div 
                      initial={{ height: 0 }} 
                      animate={{ height: `${h}%` }} 
                      transition={{ duration: 1, delay: i * 0.05 }} 
                      className={`w-full bg-gradient-to-t ${ch.color} rounded-t-md opacity-80 group-hover:opacity-100 transition-opacity shadow-sm`} 
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 text-[11px] font-semibold text-muted-foreground">
              <span>Last 8 time periods</span>
              <span className="text-white bg-white/5 px-2 py-0.5 rounded border border-white/5">Auto-updating</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Feed & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Leads Queue */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 flex flex-col justify-between border border-white/10">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Recent Activity Feed</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Real-time telemetry of incoming student applications and webhooks</p>
              </div>
              <Link href="/leads" className="text-xs font-bold text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                View All Leads →
              </Link>
            </div>

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
                        <span className="text-[10px] font-semibold bg-secondary px-2 py-0.5 rounded border border-white/5 text-muted-foreground hidden sm:inline-block">
                          {lead.courseInterest}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="truncate">{lead.email}</span>
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
          </div>
        </div>

        {/* System Notifications & Quick Actions */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary animate-pulse" />
                Live Notifications
              </h2>
              <span className="text-[10px] font-extrabold bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full">
                4 NEW
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {NOTIFICATIONS.map((n) => (
                <div key={n.id} className="p-3 rounded-xl bg-secondary/30 border border-white/5 hover:border-white/10 transition-colors flex gap-3">
                  {n.type === "success" ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" /> : n.type === "warning" ? <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" /> : <Bell className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />}
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
