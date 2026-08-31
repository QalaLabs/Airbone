"use client";

import * as React from "react";
import { TrendingUp, DollarSign, Users, Target } from "lucide-react";
import { getAnalytics } from "@/lib/crm/analytics";
import type { AnalyticsData, AnalyticsSourceRow, AnalyticsCounselorRow } from "@/lib/crm/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CRMDataTable, CRMColumn } from "@/components/shared/crm-data-table";

function formatINR(val: number): string {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val}`;
}

export default function CRMSalesAnalyticsPage() {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getAnalytics()
      .then((d) => {
        setData(d);
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

  if (error || !data) {
    return <div className="p-6 text-red-500 font-bold">Error loading analytics: {error || "No data"}</div>;
  }

  const { totals, monthly, bySource, byStatus, byCounselor } = data;
  const maxLeads = monthly.length > 0 ? Math.max(...monthly.map((m) => m.leads)) : 1;
  const maxRevenue = monthly.length > 0 ? Math.max(...monthly.map((m) => m.revenue)) : 1;

  const sourceColumns: CRMColumn<AnalyticsSourceRow>[] = [
    { key: "source", header: "Channel" },
    { key: "leads", header: "Leads", align: "right" },
    { key: "lost", header: "Lost", align: "right", render: (ch: AnalyticsSourceRow) => <span>{ch.lost ?? 0}</span> },
    {
      key: "workablePct",
      header: "Workable %",
      align: "right",
      render: (ch: AnalyticsSourceRow) => (
        <span className="font-extrabold text-sky-500">{ch.workablePct ?? "0%"}</span>
      ),
    },
    { key: "admissions", header: "Admissions", align: "right" },
    {
      key: "conversion",
      header: "CVR",
      align: "right",
      render: (ch: AnalyticsSourceRow) => {
        const val = parseFloat(ch.conversion);
        return (
          <span className={`font-extrabold ${val >= 20 ? "text-emerald-500" : "text-amber-500"}`}>
            {ch.conversion}%
          </span>
        );
      },
    },
  ];

  const statusColumns: CRMColumn<{ status: string; count: number }>[] = [
    { key: "status", header: "Lead Status" },
    { key: "count", header: "Leads", align: "right" },
  ];

  const repColumns: CRMColumn<AnalyticsCounselorRow>[] = [
    { key: "name", header: "Counselor" },
    { key: "leads", header: "Leads", align: "right" },
    { key: "admissions", header: "Admissions", align: "right" },
    { key: "conversion", header: "Conversion", align: "right" },
    { key: "calls", header: "Calls", align: "right" },
    { key: "meetings", header: "Meetings", align: "right" },
    { key: "emails", header: "Emails", align: "right" },
    {
      key: "collections",
      header: "Collections",
      align: "right",
      render: (c: AnalyticsCounselorRow) => (
        <span className="font-bold text-emerald-500">{formatINR(c.collections ?? 0)}</span>
      ),
    },
    {
      key: "collectionPct",
      header: "Collection %",
      align: "right",
      render: (c: AnalyticsCounselorRow) => (
        <span className="font-extrabold text-sky-500">{c.collectionPct ?? "0"}%</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">Sales Analytics</h1>
          <p className="text-sm text-muted-foreground">Real metrics from your persisted lead, activity and admission records</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Total Leads</p>
              <p className="text-2xl font-bold text-white mt-1">{totals.leads}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {totals.pipeline} active in pipeline
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
              <Users className="h-5 w-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Total Active Leads</p>
              <p className="text-2xl font-bold text-white mt-1">{totals.activeLeads}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">New + Call Back + Prospect</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10">
              <Users className="h-5 w-5 text-teal-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">New Leads (Today)</p>
              <p className="text-2xl font-bold text-white mt-1">{totals.newLeadsToday}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Lead enquiries created today</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Today&apos;s Follow-ups</p>
              <p className="text-2xl font-bold text-white mt-1">{totals.todayFollowUps}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Needs call-back / prospecting</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
              <Target className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Opportunity Sales (Today)</p>
              <p className="text-2xl font-bold text-white mt-1">{totals.opportunitySales}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Collected {formatINR(totals.opportunityCollections)} today
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
              <p className="text-xs text-muted-foreground font-semibold">Total Collection Pending</p>
              <p className="text-2xl font-bold text-white mt-1">{formatINR(totals.totalCollectionPending)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Outstanding fee balance</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10">
              <DollarSign className="h-5 w-5 text-rose-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Collection %</p>
              <p className="text-2xl font-bold text-white mt-1">{totals.collectionPct}%</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {formatINR(totals.totalCollections)} collected of {formatINR(totals.revenue)}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
              <DollarSign className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Workable Leads</p>
              <p className="text-2xl font-bold text-white mt-1">{totals.workableLeads}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {totals.workablePct}% of total (excl. lost)
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10">
              <Users className="h-5 w-5 text-sky-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Collections (Today)</p>
              <p className="text-2xl font-bold text-white mt-1">{formatINR(totals.collectionsToday)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Receipts recorded today</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Converted → Admission</p>
              <p className="text-2xl font-bold text-white mt-1">{totals.admissionLeads}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {totals.conversionRate}% of leads
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
              <Target className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Revenue Collected</p>
              <p className="text-2xl font-bold text-white mt-1">{formatINR(totals.revenue)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {totals.payments} completed payments
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
              <DollarSign className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Counselor Activity</p>
              <p className="text-2xl font-bold text-white mt-1">{totals.activities}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {totals.meetings} meetings · {totals.calls} calls
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
              <TrendingUp className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-white/10 shadow-lg">
          <CardHeader className="border-b border-white/5 pb-3">
            <CardTitle className="text-sm font-semibold text-white">New Leads · Last 6 Months</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {monthly.map((m) => (
                <div key={m.key} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-semibold w-10 shrink-0">{m.label}</span>
                  <div className="flex-1 h-6 rounded bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-primary/70 rounded flex items-center justify-end pr-2.5 transition-all"
                      style={{ width: `${(m.leads / maxLeads) * 100}%` }}
                    >
                      <span className="text-[10px] text-white font-extrabold">{m.leads}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-bold w-14 text-right shrink-0">
                    {m.admissions} adm
                  </span>
                </div>
              ))}
              {monthly.length === 0 && (
                <p className="text-xs text-muted-foreground">No lead records in the last 6 months.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10 shadow-lg">
          <CardHeader className="border-b border-white/5 pb-3">
            <CardTitle className="text-sm font-semibold text-white">Revenue · Last 6 Months</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {monthly.map((m) => (
                <div key={m.key} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-semibold w-10 shrink-0">{m.label}</span>
                  <div className="flex-1 h-6 rounded bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-emerald-500/70 rounded flex items-center justify-end pr-2.5 transition-all"
                      style={{ width: `${(m.revenue / maxRevenue) * 100}%` }}
                    >
                      <span className="text-[10px] text-white font-extrabold">{formatINR(m.revenue)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {monthly.length === 0 && (
                <p className="text-xs text-muted-foreground">No payment records in the last 6 months.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-white/10 shadow-lg">
          <CardHeader className="border-b border-white/5 pb-3">
            <CardTitle className="text-sm font-semibold text-white">Channel Performance</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <CRMDataTable
              columns={sourceColumns}
              data={bySource}
              searchable={false}
              pageSize={10}
            />
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10 shadow-lg">
          <CardHeader className="border-b border-white/5 pb-3">
            <CardTitle className="text-sm font-semibold text-white">Leads by Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <CRMDataTable
              columns={statusColumns}
              data={byStatus}
              searchable={false}
              pageSize={10}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-white/10 shadow-lg">
        <CardHeader className="border-b border-white/5 pb-3">
          <CardTitle className="text-sm font-semibold text-white">Counselor Performance</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {byCounselor.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No active admissions counselors found in this workspace yet.
            </p>
          ) : (
            <CRMDataTable
              columns={repColumns}
              data={byCounselor}
              searchable={false}
              pageSize={10}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
