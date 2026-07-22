"use client";

import * as React from "react";
import { Plus, Search, Filter, MoreVertical } from "lucide-react";
import { getLeadPipeline } from "@/lib/crm/sales";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const stageColors: Record<string, string> = {
  Prospecting: "bg-blue-500",
  Qualification: "bg-purple-500",
  Proposal: "bg-amber-500",
  Negotiation: "bg-orange-500",
  "Closed Won": "bg-emerald-500",
  "Closed Lost": "bg-red-500",
};

interface PipelineDeal {
  name: string;
  value: string;
  contact: string;
  days: number;
  score: number;
}

interface PipelineStage {
  name: string;
  color: string;
  deals: PipelineDeal[];
}

function formatValue(val: number | string | undefined): string {
  if (val === undefined || val === null) return "₹0";
  if (typeof val === "string") return val.startsWith("₹") ? val : `₹${val}`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val}`;
}

interface RawDeal {
  brand?: string;
  name?: string;
  customer?: string;
  deal_value?: number;
  value?: number;
  contact?: string;
  lead_name?: string;
  days_left?: number;
  days?: number;
  ai_score?: number;
  score?: number;
}

interface RawStage {
  name?: string;
  stage_name?: string;
  color?: string;
  deals?: RawDeal[];
}

export default function CRMPipelinePage() {
  const [stages, setStages] = React.useState<PipelineStage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getLeadPipeline()
      .then((data: unknown) => {
        const pipeline = Array.isArray(data)
          ? (data as RawStage[])
          : ((data as { stages?: RawStage[] })?.stages || []);
        setStages(
          pipeline.map((stage: RawStage) => ({
            name: stage.name || stage.stage_name || "Unknown",
            color: stageColors[stage.name || ""] || stage.color || "bg-gray-500",
            deals: (stage.deals || []).map((deal: RawDeal) => ({
              name: deal.brand || deal.name || deal.customer || "Unknown",
              value: formatValue(deal.deal_value || deal.value),
              contact: deal.contact || deal.lead_name || deal.customer || "",
              days: deal.days_left ?? deal.days ?? 0,
              score: deal.ai_score ?? deal.score ?? 0,
            })),
          }))
        );
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
            <h1 className="text-2xl font-bold tracking-tight text-white">Sales Pipeline</h1>
            <p className="text-sm text-muted-foreground">Deal stages and kanban board</p>
          </div>
        </div>
        <div className="p-6 text-white text-xs">Loading sales pipeline...</div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500 font-bold">Error loading pipeline: {error}</div>;
  }

  const totalDeals = stages.reduce((sum, s) => sum + s.deals.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">Sales Pipeline</h1>
          <p className="text-sm text-muted-foreground">Pipeline management and lead tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/10 text-xs font-semibold h-9">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button className="text-xs font-semibold h-9">
            <Plus className="mr-2 h-4 w-4" />
            Add Deal
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-white/5 pb-4">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search deals..." className="pl-8 h-9 text-xs bg-secondary/40 border-white/10" />
        </div>
        <select className="h-9 rounded-md border border-white/10 bg-secondary/40 px-3 text-xs text-white">
          <option>All Owners</option>
          <option>Sales Team A</option>
          <option>Sales Team B</option>
        </select>
        <div className="ml-auto">
          <Badge variant="outline" className="border-white/10 font-bold text-xs py-1 px-2.5 rounded-full">
            Total: {totalDeals} deals
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {stages.map((stage, i) => (
          <div key={i} className="min-w-[240px] bg-secondary/10 rounded-xl p-3 border border-white/5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${stage.color}`} />
                <span className="text-xs font-bold text-white">{stage.name}</span>
              </div>
              <Badge variant="secondary" className="bg-secondary/60 text-white border-none text-[10px] font-bold">
                {stage.deals.length}
              </Badge>
            </div>
            <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5">
              {stage.deals.length > 0 ? (
                stage.deals.map((deal, j) => (
                  <Card key={j} className="cursor-pointer bg-card hover:border-primary/50 border-white/5 transition-all shadow-md">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{deal.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{deal.contact}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground shrink-0 hover:text-white">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between mt-3 gap-2">
                        <span className="text-xs font-extrabold text-white shrink-0">{deal.value}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="h-1.5 w-10 rounded-full bg-secondary overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                deal.score >= 80 ? "bg-emerald-500" : deal.score >= 60 ? "bg-amber-500" : "bg-red-500"
                              }`}
                              style={{ width: `${deal.score}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-bold text-muted-foreground">{deal.score}%</span>
                        </div>
                      </div>
                      {deal.days > 0 && (
                        <p className="text-[9px] font-bold text-red-400 mt-2">{deal.days} days left</p>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-[10px] text-muted-foreground py-6 text-center italic">
                  No deals in stage
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
