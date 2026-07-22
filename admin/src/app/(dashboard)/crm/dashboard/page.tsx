"use client";

import * as React from "react";
import { TrendingUp, DollarSign, Users, Target, Calendar, Plus } from "lucide-react";
import Link from "next/link";
import { getSalesDashboard, getRevenueSummary } from "@/lib/crm/sales";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CRMDataTable, CRMColumn } from "@/components/shared/crm-data-table";

const stageColor: Record<string, string> = {
  Prospecting: "bg-blue-500",
  Qualification: "bg-purple-500",
  Proposal: "bg-amber-500",
  Negotiation: "bg-orange-500",
  "Closed Won": "bg-emerald-500",
  "Closed Lost": "bg-red-500",
};

const priorityColor: Record<string, string> = {
  high: "text-red-500",
  medium: "text-amber-500",
  low: "text-emerald-500",
};

function formatValue(val: number | string | undefined): string {
  if (val === undefined || val === null) return "₹0";
  if (typeof val === "string") return val.startsWith("₹") ? val : `₹${val}`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val}`;
}

interface PipelineStage {
  name: string;
  color?: string;
  value?: number;
  count: number;
}

interface RecentDeal {
  name: string;
  brand?: string;
  customer?: string;
  deal_value?: number;
  value?: number | string;
  deal_stage: string;
  stage?: string;
  ai_score?: number;
  score?: number;
  days_left?: number;
  days?: number;
}

interface RevenueSummary {
  total_pipeline?: number;
  won_this_month?: number;
  active_leads?: number;
  win_rate?: number;
  avg_deal_size?: number;
}

interface DashboardData {
  pipeline_stages?: PipelineStage[];
  recent_deals?: RecentDeal[];
}

export default function CRMDashboardPage() {
  const [dashboardData, setDashboardData] = React.useState<DashboardData | null>(null);
  const [revenueSummary, setRevenueSummary] = React.useState<RevenueSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    Promise.all([getSalesDashboard(), getRevenueSummary()])
      .then(([dashboard, revenue]) => {
        setDashboardData(dashboard as DashboardData);
        setRevenueSummary(revenue as RevenueSummary);
        setLoading(false);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-white">Sales Dashboard</h1>
            <p className="text-sm text-muted-foreground">Pipeline overview and deal tracking</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatCard title="Total Pipeline" value="..." icon={TrendingUp} loading />
          <StatCard title="Won This Month" value="..." icon={DollarSign} loading />
          <StatCard title="Active Leads" value="..." icon={Users} loading />
          <StatCard title="Win Rate" value="..." icon={Target} loading />
          <StatCard title="Avg Deal Size" value="..." icon={Target} loading />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500 font-bold">Error loading CRM dashboard: {error}</div>;
  }

  const pipelineStages: PipelineStage[] = dashboardData?.pipeline_stages || [];
  const recentDeals: RecentDeal[] = dashboardData?.recent_deals || [];
  const maxPipelineCount =
    pipelineStages.length > 0 ? Math.max(...pipelineStages.map((s) => s.count || 0)) : 1;

  const upcomingTasks =
    recentDeals.length > 0
      ? recentDeals.slice(0, 4).map((deal, i) => ({
          type: (["call", "email", "meeting", "task"] as const)[i % 4],
          title: `Follow up with ${deal.brand || deal.name || deal.customer || "Client"}`,
          time:
            i === 0
              ? "Today, 2:00 PM"
              : i === 1
              ? "Today, 4:30 PM"
              : i === 2
              ? "Tomorrow, 10:00 AM"
              : "Tomorrow, 2:00 PM",
          priority: (["high", "medium", "high", "low"] as const)[i],
        }))
      : [];

  const columns: CRMColumn<RecentDeal>[] = [
    {
      key: "brand",
      header: "Company",
      render: (deal: RecentDeal) => (
        <span className="font-semibold text-white">
          {deal.brand || deal.name || deal.customer}
        </span>
      ),
    },
    {
      key: "deal_value",
      header: "Value",
      render: (deal: RecentDeal) => formatValue(deal.deal_value || deal.value),
    },
    {
      key: "deal_stage",
      header: "Stage",
      render: (deal: RecentDeal) => {
        const stage = deal.deal_stage || deal.stage || "Prospecting";
        return (
          <Badge
            variant="outline"
            className={`${
              stageColor[stage] || "bg-gray-500"
            } text-white border-none px-2.5 py-0.5 rounded-full font-bold text-[10px]`}
          >
            {stage}
          </Badge>
        );
      },
    },
    {
      key: "ai_score",
      header: "AI Fit Score",
      render: (deal: RecentDeal) => {
        const score = deal.ai_score || deal.score || 0;
        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-16 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-muted-foreground">{score}%</span>
          </div>
        );
      },
    },
    {
      key: "days_left",
      header: "Timeline Status",
      render: (deal: RecentDeal) => {
        const days = deal.days_left ?? deal.days ?? 0;
        return days > 0 ? (
          <span
            className={`text-xs font-semibold ${
              days <= 7 ? "text-red-500 font-bold" : "text-muted-foreground"
            }`}
          >
            {days} days left
          </span>
        ) : (
          <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-none font-bold">
            Won
          </Badge>
        );
      },
    },
    {
      key: "action",
      header: "Action",
      render: () => (
        <Button variant="ghost" size="sm" className="text-xs font-bold text-primary hover:text-white">
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">Sales Dashboard</h1>
          <p className="text-sm text-muted-foreground">Pipeline overview and deal tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/10 text-xs font-semibold h-9">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          <Button className="text-xs font-semibold h-9">
            <Plus className="mr-2 h-4 w-4" />
            New Deal
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Pipeline"
          value={revenueSummary?.total_pipeline ? formatValue(revenueSummary.total_pipeline) : "—"}
          icon={TrendingUp}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Won This Month"
          value={revenueSummary?.won_this_month ? formatValue(revenueSummary.won_this_month) : "—"}
          icon={DollarSign}
          iconColor="text-emerald-500"
        />
        <StatCard
          title="Active Leads"
          value={revenueSummary?.active_leads ? String(revenueSummary.active_leads) : "—"}
          icon={Users}
          iconColor="text-purple-500"
        />
        <StatCard
          title="Win Rate"
          value={revenueSummary?.win_rate ? `${revenueSummary.win_rate}%` : "—"}
          icon={Target}
          iconColor="text-amber-500"
        />
        <StatCard
          title="Avg Deal Size"
          value={revenueSummary?.avg_deal_size ? formatValue(revenueSummary.avg_deal_size) : "—"}
          icon={Target}
          iconColor="text-cyan-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-white/10 shadow-lg">
          <CardHeader className="border-b border-white/5 pb-3">
            <CardTitle className="text-sm font-semibold text-white">Pipeline by Stage</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {pipelineStages.map((stage, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full shrink-0 ${
                      stage.color || stageColor[stage.name] || "bg-gray-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white truncate">{stage.name}</span>
                      <span className="text-xs font-bold text-muted-foreground shrink-0">
                        {stage.value ? formatValue(stage.value) : ""}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          stage.color || stageColor[stage.name] || "bg-gray-500"
                        }`}
                        style={{ width: `${((stage.count || 0) / maxPipelineCount) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white shrink-0">{stage.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10 shadow-lg">
          <CardHeader className="border-b border-white/5 pb-3">
            <CardTitle className="text-sm font-semibold text-white">Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/40 transition-colors"
                  >
                    <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${priorityColor[task.priority ?? "normal"] ?? "bg-gray-400"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{task.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{task.time}</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-bold capitalize border-white/10 shrink-0">
                      {task.type}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">No upcoming tasks</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-white/10 shadow-lg">
        <CardHeader className="border-b border-white/5 pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-white">Recent Deals</CardTitle>
          <Link href="/crm/deals">
            <Button variant="ghost" size="sm" className="text-xs font-bold text-muted-foreground hover:text-white">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-4">
          <CRMDataTable
            columns={columns}
            data={recentDeals}
            searchable={false}
            pageSize={10}
          />
        </CardContent>
      </Card>
    </div>
  );
}
