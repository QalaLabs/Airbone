"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, GraduationCap, BookOpen, Star, TrendingUp, FileText, Briefcase } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalLeads: number;
  pendingAdmissions: number;
  activeStudents: number;
  pendingTestimonials: number;
  totalCourses: number;
  totalJobs: number;
}

interface RecentLead {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ["leads", "dashboard"],
    queryFn: () => apiFetch<{ items: RecentLead[]; total: number }>("/leads?page=1&limit=5"),
  });

  const { data: admissions, isLoading: admissionsLoading } = useQuery({
    queryKey: ["admissions", "dashboard"],
    queryFn: () => apiFetch<{ items: { id: string }[]; total: number }>("/admissions?page=1&limit=1"),
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["students", "dashboard"],
    queryFn: () => apiFetch<{ items: unknown[]; total: number }>("/students?page=1&limit=1"),
  });

  const { data: pendingCount } = useQuery({
    queryKey: ["testimonials", "pending-count"],
    queryFn: () => apiFetch<{ count: number }>("/testimonials/pending-count"),
  });

  const { data: courses } = useQuery({
    queryKey: ["courses", "dashboard"],
    queryFn: () => apiFetch<{ items: unknown[]; total: number }>("/courses?page=1&limit=1"),
  });

  const { data: jobs } = useQuery({
    queryKey: ["jobs", "dashboard"],
    queryFn: () => apiFetch<{ items: unknown[]; total: number }>("/jobs?page=1&limit=1"),
  });

  const statsLoading = leadsLoading || admissionsLoading || studentsLoading;

  const recentLeads = leads?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome to the Airborne Aviation Academy Operations Platform"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Leads"
          value={leads?.total ?? 0}
          icon={Users}
          iconColor="text-primary"
          description="All time leads"
          loading={leadsLoading}
        />
        <StatCard
          title="Pending Admissions"
          value={admissions?.total ?? 0}
          icon={GraduationCap}
          iconColor="text-warning"
          description="Awaiting processing"
          loading={admissionsLoading}
        />
        <StatCard
          title="Active Students"
          value={students?.total ?? 0}
          icon={BookOpen}
          iconColor="text-success"
          description="Currently enrolled"
          loading={studentsLoading}
        />
        <StatCard
          title="Pending Reviews"
          value={pendingCount?.count ?? 0}
          icon={Star}
          iconColor="text-warning"
          description="Testimonials to review"
          loading={!pendingCount}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          title="Total Courses"
          value={courses?.total ?? 0}
          icon={FileText}
          iconColor="text-primary"
          description="Published & draft courses"
          loading={!courses}
        />
        <StatCard
          title="Active Jobs"
          value={jobs?.total ?? 0}
          icon={Briefcase}
          iconColor="text-success"
          description="Open positions"
          loading={!jobs}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {leadsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : recentLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No leads yet</p>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={lead.status} domain="lead" />
                      <p className="text-xs text-muted-foreground">{formatDate(lead.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Users, label: "Add Lead", href: "/leads" },
                { icon: GraduationCap, label: "View Admissions", href: "/admissions" },
                { icon: Star, label: "Review Testimonials", href: "/testimonials" },
                { icon: Briefcase, label: "Manage Jobs", href: "/jobs" },
              ].map((action) => (
                <a
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-2 rounded-lg border border-border p-3 hover:bg-accent transition-colors group"
                >
                  <action.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{action.label}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
