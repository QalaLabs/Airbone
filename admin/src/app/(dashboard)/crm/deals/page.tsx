"use client";

import * as React from "react";
import { Plus, Filter, MoreVertical, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { getDeals } from "@/lib/crm/deals";
import { Deal } from "@/lib/crm/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CRMDataTable, CRMColumn } from "@/components/shared/crm-data-table";

const stageColor: Record<string, string> = {
  Prospecting: "bg-blue-500",
  Qualification: "bg-purple-500",
  Proposal: "bg-amber-500",
  Negotiation: "bg-orange-500",
  "Closed Won": "bg-emerald-500",
  "Closed Lost": "bg-red-500",
};

function formatValue(val: number | string | undefined): string {
  if (val === undefined || val === null) return "₹0";
  if (typeof val === "string") return val.startsWith("₹") ? val : `₹${val}`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val}`;
}

export default function CRMDealsPage() {
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getDeals()
      .then((d) => {
        setDeals(d);
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

  if (error) {
    return <div className="p-6 text-red-500 font-bold">Error loading deals: {error}</div>;
  }

  const totalValue = deals.reduce((sum, d) => sum + (d.deal_value || 0), 0);
  const wonDeals = deals.filter((d) => d.deal_stage === "Closed Won");
  const wonValue = wonDeals.reduce((sum, d) => sum + (d.deal_value || 0), 0);
  const winRate = deals.length > 0 ? ((wonDeals.length / deals.length) * 100).toFixed(1) : "0";
  const avgCycle = deals.length > 0
    ? Math.round(deals.reduce((sum, d) => sum + (d.days_left || 0), 0) / deals.length)
    : null;

  const columns: CRMColumn<Deal>[] = [
    {
      key: "name",
      header: "Deal",
      render: (deal: Deal) => (
        <div>
          <p className="font-semibold text-white">{deal.brand || deal.name}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{deal.source || "Website"}</p>
        </div>
      ),
    },
    {
      key: "value",
      header: "Value",
      align: "right",
      render: (deal: Deal) => (
        <span className="font-extrabold text-white">{formatValue(deal.deal_value)}</span>
      ),
    },
    {
      key: "stage",
      header: "Stage",
      render: (deal: Deal) => {
        const stage = deal.deal_stage || "Prospecting";
        return (
          <Badge
            variant="outline"
            className={`${
              stageColor[stage] || "bg-gray-500"
            } text-white border-none text-[9px] px-2.5 py-0.5 rounded-full`}
          >
            {stage}
          </Badge>
        );
      },
    },
    {
      key: "owner",
      header: "Owner",
      render: (deal: Deal) => deal.lead_owner || "N/A",
    },
    {
      key: "probability",
      header: "Probability",
      render: (deal: Deal) => {
        const prob = deal.ai_score || 0;
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-12 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  prob >= 80 ? "bg-emerald-500" : prob >= 60 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${prob}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground">{prob}%</span>
          </div>
        );
      },
    },
    {
      key: "closeDate",
      header: "Close Date",
      render: (deal: Deal) =>
        deal.creation
          ? new Date(deal.creation).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "N/A",
    },
    {
      key: "product",
      header: "Product",
      render: (deal: Deal) => (
        <Badge variant="secondary" className="border-none text-[9px] font-bold">
          {deal.product || "Standard"}
        </Badge>
      ),
    },
    {
      key: "action",
      header: "Action",
      render: () => (
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-white">
          <MoreVertical className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">Deals</h1>
          <p className="text-sm text-muted-foreground">Manage your brand deals and partnerships</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/10 text-xs font-semibold h-9">Export</Button>
          <Button className="text-xs font-semibold h-9">
            <Plus className="mr-2 h-4 w-4" />
            New Deal
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Total Deal Value</p>
              <p className="text-2xl font-bold text-white mt-1">{formatValue(totalValue)}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Won This Month</p>
              <p className="text-2xl font-bold text-white mt-1">{formatValue(wonValue)}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Win Rate</p>
              <p className="text-2xl font-bold text-white mt-1">{winRate}%</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
              <ArrowUpRight className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Avg Sales Cycle</p>
              <p className="text-2xl font-bold text-white mt-1">
                {avgCycle !== null ? `${avgCycle} days` : "—"}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
              <ArrowDownRight className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-white/10 shadow-lg">
        <CardContent className="p-4">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <TabsList className="bg-transparent gap-4">
                <TabsTrigger value="all" className="text-xs font-semibold text-muted-foreground data-[state=active]:text-white">All Deals</TabsTrigger>
                <TabsTrigger value="active" className="text-xs font-semibold text-muted-foreground data-[state=active]:text-white">Active</TabsTrigger>
                <TabsTrigger value="won" className="text-xs font-semibold text-muted-foreground data-[state=active]:text-white">Won</TabsTrigger>
                <TabsTrigger value="lost" className="text-xs font-semibold text-muted-foreground data-[state=active]:text-white">Lost</TabsTrigger>
              </TabsList>
              <Button variant="outline" className="border-white/10 text-xs font-semibold h-8">
                <Filter className="mr-2 h-3.5 w-3.5" />
                Filter
              </Button>
            </div>
            <TabsContent value="all" className="mt-0">
              <CRMDataTable columns={columns} data={deals} searchable={false} pageSize={10} />
            </TabsContent>
            <TabsContent value="active" className="mt-0">
              <CRMDataTable
                columns={columns}
                data={deals.filter((d) => d.deal_stage !== "Closed Won" && d.deal_stage !== "Closed Lost")}
                searchable={false}
                pageSize={10}
              />
            </TabsContent>
            <TabsContent value="won" className="mt-0">
              <CRMDataTable
                columns={columns}
                data={deals.filter((d) => d.deal_stage === "Closed Won")}
                searchable={false}
                pageSize={10}
              />
            </TabsContent>
            <TabsContent value="lost" className="mt-0">
              <CRMDataTable
                columns={columns}
                data={deals.filter((d) => d.deal_stage === "Closed Lost")}
                searchable={false}
                pageSize={10}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
