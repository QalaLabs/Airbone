"use client";

import * as React from "react";
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getDealsData } from "@/lib/crm/deals";
import type { DealData } from "@/lib/crm/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CRMDataTable, CRMColumn } from "@/components/shared/crm-data-table";

function formatINR(val: number): string {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val}`;
}

const stageOrder = [
  "ENQUIRY",
  "DOCUMENT_COLLECTION",
  "VERIFICATION",
  "OFFER_LETTER",
  "FEE_PAYMENT",
  "ENROLLED",
  "DROPPED",
  "CANCELLED",
];

const stageColor: Record<string, string> = {
  ENQUIRY: "bg-blue-500",
  DOCUMENT_COLLECTION: "bg-purple-500",
  VERIFICATION: "bg-indigo-500",
  OFFER_LETTER: "bg-amber-500",
  FEE_PAYMENT: "bg-orange-500",
  ENROLLED: "bg-emerald-500",
  DROPPED: "bg-red-500",
  CANCELLED: "bg-red-500",
};

export default function CRMDealsPage() {
  const [data, setData] = React.useState<DealData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getDealsData()
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
            <h1 className="text-2xl font-bold tracking-tight text-white">Deals</h1>
            <p className="text-sm text-muted-foreground">Manage your brand deals and partnerships</p>
          </div>
        </div>
        <div className="p-6 text-white text-xs">Loading deals grid...</div>
      </div>
    );
  }

  if (error || !data) {
    return <div className="p-6 text-red-500 font-bold">Error loading deals: {error || "No data"}</div>;
  }

  const { capability, derived } = data;

  const stageRows = stageOrder
    .filter((s) => (derived.byStage[s] ?? 0) > 0 || s === "ENROLLED")
    .map((s) => ({ stage: s, count: derived.byStage[s] ?? 0 }));

  const stageColumns: CRMColumn<{ stage: string; count: number }>[] = [
    {
      key: "stage",
      header: "Stage",
      render: (r) => (
        <Badge className={`${stageColor[r.stage] || "bg-gray-500"} text-white border-none text-[9px] px-2.5 py-0.5 rounded-full`}>
          {r.stage}
        </Badge>
      ),
    },
    { key: "count", header: "Admissions", align: "right" },
  ];

  const admissionColumns: CRMColumn<DealData["recentAdmissions"][number]>[] = [
    {
      key: "applicationNo",
      header: "Application",
      render: (a) => <span className="font-semibold text-white">{a.applicationNo}</span>,
    },
    {
      key: "lead",
      header: "Lead",
      render: (a) => a.lead?.name ?? "—",
    },
    {
      key: "stage",
      header: "Stage",
      render: (a) => (
        <Badge className={`${stageColor[a.stage] || "bg-gray-500"} text-white border-none text-[9px] px-2 py-0.5 rounded-full`}>
          {a.stage}
        </Badge>
      ),
    },
    {
      key: "feeFinal",
      header: "Value",
      align: "right",
      render: (a) => (a.feeFinal != null ? formatINR(Number(a.feeFinal)) : "—"),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (a) =>
        new Date(a.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
    },
  ];

  const convertedColumns: CRMColumn<DealData["recentConvertedLeads"][number]>[] = [
    {
      key: "name",
      header: "Lead",
      render: (l) => <span className="font-semibold text-white">{l.name}</span>,
    },
    {
      key: "updatedAt",
      header: "Converted",
      render: (l) =>
        new Date(l.updatedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">Deals</h1>
          <p className="text-sm text-muted-foreground">Derived pipeline from real admission + lead records</p>
        </div>
      </div>

      {!capability.deals && (
        <Card className="border-amber-500/40 bg-amber-500/10 shadow-lg">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-100 space-y-1">
              <p className="font-bold text-amber-400">Deal module not implemented</p>
              <p>{capability.reason}</p>
              <p className="text-amber-200/80">
                The numbers below are real records from the admission funnel and lead pipeline — no
                fabricated deal data.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Funnel Value</p>
              <p className="text-2xl font-bold text-white mt-1">{formatINR(derived.pipelineValue)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{derived.pipeline} active records</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
              <DollarSign className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Enrolled Value</p>
              <p className="text-2xl font-bold text-white mt-1">{formatINR(derived.wonValue)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{derived.won} enrolled admissions</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Converted Leads</p>
              <p className="text-2xl font-bold text-white mt-1">{derived.convertedLeads}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-semibold">Source</p>
            <p className="text-lg font-bold text-white mt-1 leading-tight">{derived.funnelName}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-white/10 shadow-lg">
          <CardHeader className="border-b border-white/5 pb-3">
            <CardTitle className="text-sm font-semibold text-white">Admission Funnel</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {stageRows.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No admission records exist yet — the funnel is empty until the first application is created.
              </p>
            ) : (
              <CRMDataTable columns={stageColumns} data={stageRows} searchable={false} pageSize={10} />
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10 shadow-lg">
          <CardHeader className="border-b border-white/5 pb-3">
            <CardTitle className="text-sm font-semibold text-white">Recent Converted Leads</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {data.recentConvertedLeads.length === 0 ? (
              <p className="text-xs text-muted-foreground">No leads marked CONVERTED yet.</p>
            ) : (
              <CRMDataTable columns={convertedColumns} data={data.recentConvertedLeads} searchable={false} pageSize={10} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-white/10 shadow-lg">
        <CardHeader className="border-b border-white/5 pb-3">
          <CardTitle className="text-sm font-semibold text-white">Recent Admissions</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {data.recentAdmissions.length === 0 ? (
            <p className="text-xs text-muted-foreground">No admission records created yet.</p>
          ) : (
            <CRMDataTable columns={admissionColumns} data={data.recentAdmissions} searchable={false} pageSize={10} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
