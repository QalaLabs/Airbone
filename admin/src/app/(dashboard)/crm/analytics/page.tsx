"use client";

import * as React from "react";
import { TrendingUp, DollarSign, Users, Target } from "lucide-react";
import { getSalesAnalytics, getConversionRate } from "@/lib/crm/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CRMDataTable, CRMColumn } from "@/components/shared/crm-data-table";

interface MonthlyMetric {
  month: string;
  revenue: number;
  deals: number;
  forecasted: number;
}

interface RawChannel {
  source?: string;
  channel?: string;
  count?: number;
  leads?: number;
  meetings?: number;
  deals?: number;
  revenue?: number;
  conversion?: string;
}

interface ChannelPerformance extends Record<string, unknown> {
  channel: string;
  leads: number;
  deals: number;
  revenue: string;
  conversion: string;
}

interface RepPerformance extends Record<string, unknown> {
  name: string;
  deals: number;
  revenue: string;
  winRate: string;
  avgDeal: string;
  quota: string;
}

interface AnalyticsData {
  monthly?: MonthlyMetric[];
  channels?: RawChannel[];
  reps?: RepPerformance[];
  conversionRate?: {
    win_rate?: number;
  };
}

export default function CRMSalesAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    Promise.all([getSalesAnalytics(), getConversionRate()])
      .then(([analytics, conversion]) => {
        setAnalyticsData({
          ...(analytics as AnalyticsData),
          conversionRate: conversion as { win_rate?: number },
        });
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
            <h1 className="text-2xl font-bold tracking-tight text-white">Sales Analytics</h1>
            <p className="text-sm text-muted-foreground">Performance metrics and forecasting</p>
          </div>
        </div>
        <div className="p-6 text-white text-xs">Loading analytics reports...</div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return <div className="p-6 text-red-500 font-bold">Error loading analytics: {error || "No data"}</div>;
  }

  const monthlyMetrics: MonthlyMetric[] = analyticsData.monthly || [];
  const rawChannels: RawChannel[] = analyticsData.channels || [];
  const repPerformance: RepPerformance[] = analyticsData.reps || [];

  const channelPerformance: ChannelPerformance[] = rawChannels.map((ch) => ({
    channel: ch.source || ch.channel || "Unknown",
    leads: ch.count || ch.leads || 0,
    deals: ch.deals || 0,
    revenue: ch.revenue ? `₹${ch.revenue}L` : "₹0",
    conversion: ch.conversion || `${ch.count && ch.count > 0 ? "0" : "0"}%`,
  }));

  const totalRevenue = monthlyMetrics.reduce((sum, m) => sum + (m.revenue || 0), 0);
  const totalDeals = monthlyMetrics.reduce((sum, m) => sum + (m.deals || 0), 0);
  const maxRevenue = monthlyMetrics.length > 0 ? Math.max(...monthlyMetrics.map((m) => m.revenue || 0)) : 1;

  const channelColumns: CRMColumn<ChannelPerformance>[] = [
    { key: "channel", header: "Channel" },
    { key: "leads", header: "Leads", align: "right" },
    { key: "deals", header: "Deals", align: "right" },
    { key: "revenue", header: "Revenue", align: "right", className: "font-semibold text-white" },
    {
      key: "conversion",
      header: "CVR",
      align: "right",
      render: (ch: ChannelPerformance) => {
        const val = parseFloat(ch.conversion);
        return (
          <span
            className={`font-extrabold ${val >= 20 ? "text-emerald-500" : "text-amber-500"}`}
          >
            {ch.conversion}
          </span>
        );
      },
    },
  ];

  const repColumns: CRMColumn<RepPerformance>[] = [
    { key: "name", header: "Rep" },
    { key: "deals", header: "Deals", align: "right" },
    { key: "revenue", header: "Revenue", align: "right", className: "font-semibold text-white" },
    { key: "winRate", header: "Win Rate", align: "right" },
    { key: "avgDeal", header: "Avg Deal", align: "right" },
    { key: "quota", header: "Quota", align: "right" },
    {
      key: "performance",
      header: "Performance",
      render: (rep: RepPerformance) => {
        const quota = parseInt(rep.quota || "0");
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  quota >= 100 ? "bg-emerald-500" : quota >= 80 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${Math.min(quota, 120)}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground">{quota}%</span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">Sales Analytics</h1>
          <p className="text-sm text-muted-foreground">Performance metrics and forecasting</p>
        </div>
        <div className="flex gap-2">
          <select className="h-9 rounded-md border border-white/10 bg-secondary/40 px-3 text-xs text-white">
            <option>Last 6 Months</option>
            <option>Last 12 Months</option>
            <option>This Quarter</option>
            <option>This Year</option>
          </select>
          <Button variant="outline" className="border-white/10 text-xs font-semibold h-9">Export Report</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Total Revenue</p>
              <p className="text-2xl font-bold text-white mt-1">
                ₹{totalRevenue.toFixed(1)}L
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Total Deals</p>
              <p className="text-2xl font-bold text-white mt-1">{totalDeals}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
              <Target className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Win Rate</p>
              <p className="text-2xl font-bold text-white mt-1">
                {analyticsData.conversionRate?.win_rate
                  ? `${analyticsData.conversionRate.win_rate}%`
                  : "—"}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Avg Deal Size</p>
              <p className="text-2xl font-bold text-white mt-1">
                {totalDeals > 0 ? `₹${(totalRevenue / totalDeals).toFixed(2)}L` : "—"}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
              <Users className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-white/10 shadow-lg">
          <CardHeader className="border-b border-white/5 pb-3">
            <CardTitle className="text-sm font-semibold text-white">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {monthlyMetrics.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-semibold w-8 shrink-0">{m.month}</span>
                  <div className="flex-1 h-6 rounded bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-primary/70 rounded flex items-center justify-end pr-2.5 transition-all"
                      style={{ width: `${((m.revenue || 0) / maxRevenue) * 100}%` }}
                    >
                      <span className="text-[10px] text-white font-extrabold">₹{m.revenue}L</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-bold w-16 text-right shrink-0">
                    {m.deals} deals
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10 shadow-lg">
          <CardHeader className="border-b border-white/5 pb-3">
            <CardTitle className="text-sm font-semibold text-white">Channel Performance</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <CRMDataTable
              columns={channelColumns}
              data={channelPerformance}
              searchable={false}
              pageSize={10}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-white/10 shadow-lg">
        <CardHeader className="border-b border-white/5 pb-3">
          <CardTitle className="text-sm font-semibold text-white">Rep Performance</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <CRMDataTable
            columns={repColumns}
            data={repPerformance}
            searchable={false}
            pageSize={10}
          />
        </CardContent>
      </Card>
    </div>
  );
}
